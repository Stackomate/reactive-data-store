import { ReactiveInputsArray, execOptions, ReviewedNodeResult } from '../types';
import { idGenFn } from './ids';
import { PropNode } from './classes';
import { yieldForEach } from '../reusable/yield-for-each';
import { ReactiveDataStore } from './reactive-data-store';

export function *maybeEvaluateProp<A extends any, B extends ReactiveInputsArray, C extends [string, any]>(
    rds: ReactiveDataStore, prop: PropNode<A, B, C>, options: execOptions
) {
    const propId = idGenFn(prop);
    if (rds.toReview.has(propId)) {
        rds.currentItem = idGenFn(prop);
        if (options.debug === true)
            yield;
        /* TODO: Typings */
        /* TODO: Performance may be improved */
        /* This is similar to map(), but it keeps "empty" slots in the array */
        const args = prop.inputs.reduce((acc, input, index) => {
            if (input === undefined) {
                return acc;
            }
            const maybeReviewed = (rds.reviewed.get(idGenFn(input)) || {
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
        }, []);
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
            /* TODO: Fix type */
            args as any, prop.value, subscriptionChanges);
        /* We augument the result */

        /* Throw error if undefined (no return) */
        /* TODO: May be disabled for production? */
        if (runFn === undefined) {
            throw new Error('Prop did not return null or actions and value')
        }

        /* TODO: Any types */
        let fnResult: ReviewedNodeResult<any, any> = runFn === null ? {
            value: prop.value,
            previousValue: prop.value,
            pushed: false,
            actions: [],
            dependencyChanges: args
        } : {
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
        rds.reviewed.set(propId, fnResult);
        rds.triggerListeners(rds.listeners.evaluatedProperty, [propId, changed, runFn]);
        if (options.debug === true)
            yield;
        if (changed) {
            yield* yieldForEach(prop.outputs, rds.markForCheck.bind(rds, options));
        }
        rds.toReview.delete(propId);
        if (options.debug === true)
            yield;
    }
}