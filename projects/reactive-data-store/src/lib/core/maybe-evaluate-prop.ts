import { yieldForEach } from '../reusable/yield-for-each';
import { execOptions, ReactiveInputsArray, ReviewedNodeResult, ChangesSummary, DefaultActionTuple } from '../types';
import { PropNode } from './classes';
import { ReactiveDataStore } from './reactive-data-store';

export function *maybeEvaluateProp<A extends any, B extends ReactiveInputsArray, C extends DefaultActionTuple>(
    rds: ReactiveDataStore, prop: PropNode<A, B, C>, options: execOptions
) {
    if (rds.toReview.has(prop)) {
        rds.currentItem = prop;
        if (options.debug === true)
            yield;
        /* TODO: Typings */
        /* TODO: Performance may be improved */
        /* This is similar to map(), but it keeps "empty" slots in the array */
        const args: {
            [P in keyof B]: ChangesSummary<B[P]>
        } = prop.inputs.reduce((acc, input, index) => {
            if (input === undefined) {
                return acc;
            }
            const maybeReviewed = (rds.reviewed.get(input) || {
                actions: [],
                value: input.value,
                previous: input.value,
            });
            /* Notice only non empty indexes are modified */
            acc[index] = {
                actions: 'actions' in maybeReviewed ? maybeReviewed.actions : [],
                /* Fallback to previous value if not reviewed/computed */
                value: 'value' in maybeReviewed ? maybeReviewed.value : input.value,
                previous: input.value
            };
            return acc;
        }, 
        /* TODO: Remove any */
        [] as any);
        const subscriptionChanges = {
            /* TODO: Improve code */
            added: (rds.subscriptionModifications.get(prop) || {
                added: new Map()
            }).added,
            removed: (rds.subscriptionModifications.get(prop) || {
                removed: new Map()
            }).removed,
            isInit: rds.isFirstRun
        };
        /* This is the result returned directly from the function call */
        /* TODO: Add error-handling cases */
        let runFn = prop.fn(
            args, prop.value, subscriptionChanges);

        /* Throw error if undefined (no return) */
        /* TODO: May be disabled for production? */
        if (runFn === undefined) {
            throw new Error('Prop did not return null or actions and value')
        }

        /* We augument the returned object */
        let fnResult: ReviewedNodeResult<A, B, C> = runFn === null ? {
            value: prop.value,
            previousValue: prop.value,
            pushed: false,
            actions: [],
            /* TODO: Type */
            dependencyChanges: args
        } : 
        {
            actions: runFn.actions,
            value: runFn.value,
            previousValue: prop.value,
            pushed: true,
            dependencyChanges: args
        };
        let changed = runFn !== null;
        if ((runFn !== null) && (runFn.actions.length === 0)) {
            throw new Error(`Declared change, but provided empty actions array`);
        };
        /* trigger error for props that did not emit during firstRun */
        if (changed === false && rds.isFirstRun === true) {
            throw new Error(`Property did not emit during init: ${prop.label}`);
        }
        rds.reviewed.set(prop, fnResult);
        rds.triggerListeners(rds.listeners.evaluatedProperty, [prop, changed, runFn]);
        if (options.debug === true)
            yield;
        if (changed) {
            yield* yieldForEach(prop.outputs, rds.markForCheck.bind(rds, options));
        }
        rds.toReview.delete(prop);
        if (options.debug === true)
            yield;
    }
}