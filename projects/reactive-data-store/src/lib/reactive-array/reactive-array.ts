import { Prop, PropNode, State, StateNode, PropFactory } from '../core/classes';
import { ReactiveDataStore } from '../core/reactive-data-store';
import { setForTransaction } from "../core/set-for-transaction";
import { InputChangesSummary, PropFnReturn } from '../types';
import { NonEmptyArray } from "../types-general";
import { AnyReactiveNode, ReactiveNode, ReactiveNodeOfValue } from "../types-base";
import { RAAction, SET_KEY_ACTION } from "../types-actions";
import { propUtils, pushChange } from '../utils/prop-utils';

/** Create a Prop that behaves as a ReactiveArray. */
export const ReactiveArraySignature = Symbol('ReactiveArraySignature');

export const ReactiveArray = function <T>(arr: (T | ReactiveNode<T, any, any>)[]) {
    /* First, we transform the provided array. 
    Loop through the items, and make each item a Reactive Node, 
    except if it already is one.
    */
    let reactiveNodesInputs: ReactiveNodeOfValue<T>[] = arr.map(item => {
        if (item instanceof StateNode || item instanceof PropNode) {
            return item;
        }
        return State(item);
    });

    /* TODO: Improve type */
    const ret = PropFactory(reactiveNodesInputs) <T[], RAAction<T>> ((inputChanges, previousValue: T[], subscriptionChanges) => {

        let { isInit } = subscriptionChanges;
        let value = previousValue;

        /* Every Reactive Object needs to emit an initial action */
        if (isInit === true) {
            value = inputChanges.map(input => input.value);
            return pushChange(value);
        }

        /* Clone array to avoid mutating current state */
        value = [...value];

        const utils = propUtils(inputChanges, subscriptionChanges);

        const changes: RAAction<T>[] = [];

        /* TODO: What to do with removed items? Undefined? */
        utils.forRemoved((rNode, index) => {
            /* TODO Make all three pushes immutable */
            changes.push([
                'DELETE_KEY',
                index
            ]);
            delete value[index];
            /* Update length if necessary */
            if (index + 1 === value.length) {
                value.length = index;
            }
        })

        utils.forAdded((rNode, index) => {
            changes.push([
                'SET_KEY',
                [index, rNode.value]
            ]);            
            value[index] = rNode.value;
        })

        utils.forSameWithChanges((rNode, index) => {
            /* TODO: Implement check for ReactiveMap and ReactiveSet */ 
            if (reactiveNodesInputs[index].signature === ReactiveArraySignature) {
                /* TODO: Improve rNode type */
                rNode.actions.forEach((action: any) => {
                    if (action[0] === 'SET_KEY' || action[0] === 'DELETE_KEY') {
                        /* TODO: Remove as any from here */
                        changes.push([
                            'SET_KEY_INNER',
                            [index, [action] ]
                        ] as any)
                    } else {
                        changes.push([
                            'SET_KEY',
                            [index, rNode.value]
                        ]);                                    
                    }
                });
                value[index] = rNode.value;
            } else {
                changes.push([
                    'SET_KEY',
                    [index, rNode.value]
                ]);            
                value[index] = rNode.value;
            }            

        })

        /* TODO: Not considering remove & add overlap optimization for nested arrays with similar content.
        In that case, should diff between indexes or not? */

        return changes.length > 0 ? {
            actions: (changes as NonEmptyArray<RAAction<T>>),
            value: value
        } : null;

    });

    /* Add Reactive Array signature to Prop */
    ret.signature = ReactiveArraySignature;

    return ret;
}

export const setIndex = <T>(rds: ReactiveDataStore, rarr: PropNode<T[], any, any>, key: number, value: T) => {
    /* TODO: Type is any for rarr.inputs[key] */
    /* TODO: Simplify method with setForChange in RDS api */
    const targetNode = rarr.inputs[key];
    if (targetNode instanceof StateNode) {
        rds.addChange(targetNode, value);
    } else if (targetNode instanceof PropNode ) {
        if (targetNode.api.set) {
            targetNode.api.set(value, targetNode.inputs, setForTransaction.bind(rds));
        } else {
            throw new Error('Prop does not contain set method')
        }
    } else {
        throw new Error('Target node is not State or Prop')
    }
}

export const push = <T>(rds: ReactiveDataStore, rarr: PropNode<T[], any, any>, value: T) => {
    /* First, wrap value if it's not state or prop */
    let wrappedValue: AnyReactiveNode;
    if (!(value instanceof StateNode) && !(value instanceof PropNode)) {
        wrappedValue = State(value);
    } else {
        wrappedValue = value;
    }

    rds.addDependencies(rarr, [wrappedValue]);

}



function updateArrayValueAndActions<T>(changes: SET_KEY_ACTION<T>[], value: T[]) {
    return ([summary, index]: [InputChangesSummary<ReactiveNodeOfValue<T>>, number]) => {
        /* TODO: Improve code */
        changes.push([
            'SET_KEY',
            [index, summary.value]
        ]);
        value[index] = summary.value;
    };
}

