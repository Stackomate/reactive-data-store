import { MapValuesTo } from '../utils/prop-factories';
import { ReactiveArray } from './reactive-array';
import { ReactiveNode, RMapAction, NonEmptyArray } from '../types';
import { Prop, PropFactory } from '../core/classes';
import { pushChange, propUtils } from '../utils/prop-utils';
import { RAAction } from 'reactive-data-store/lib/types';
/* TODO: type */
export const ReactiveMap = <K, V>(entries: Array<[K | ReactiveNode<K, any, any>, V | ReactiveNode<V, any, any>]>) => {
    /* TODO: Enforce tuple */
    /* TODO: Forbid entries to provide same key twice, maybe Dev-only */
    let reactiveTuples = entries.map((tuple: [K, V]) => ReactiveArray(tuple));
    /* TODO: Optimize return type */
    let resultProp = PropFactory(reactiveTuples) <Map<K, V>, RMapAction<K, V>> (
        (inputChanges, previousValue, subsChanges) => {

        let { isInit } = subsChanges;
        
        if (isInit === true) {
            let finalMap = new Map<K, V>();
            inputChanges.map(i => i.value).forEach(([key, value]: [K, V]) => {
                finalMap.set(key, value);
            });

            return pushChange(finalMap);
        }

        /* If not init, */
        /* Clone map to avoid mutating current state */
        let value = new Map<K, V>(previousValue); 

        const utils = propUtils(inputChanges, subsChanges);

        const changes: RMapAction<K, V>[] = [];  

        /* TODO: Types */
        /* TODO: What to do with removed items? Undefined? */
        utils.forRemoved((rNode, index) => {
            /* TODO Make all three pushes immutable */
            /* TODO: Type */
            const action: any  = [
                'DELETE_MAP_PAIR',
                rNode.value[0]
            ] 
            changes.push(action);
            value.delete(rNode.value[0]);
        });

        utils.forAdded((rNode, index) => {
            /* TODO: Type */
            const action: any = [
                'SET_MAP_PAIR',
                [
                    ['SET', rNode.value[0], rNode.value[0]], 
                    ['SET', rNode.value[1]]
                ]
            ];
            changes.push(action);            
            value.set(rNode.value[0], rNode.value[1]);
        })

        utils.forSameWithChanges((rNode, index) => {
            /* TODO: Implement check for ReactiveMap and ReactiveSet */
            const k =  indexFn(rNode, 0);
            const v = indexFn(rNode, 1);
            if (false) {

            }
            else {
                /* TODO: Type */
                const action: any = [
                    'SET_MAP_PAIR',
                    [
                        k.actions, 
                        v.actions
                    ]
                ];
                changes.push(action);   
            
                /* First, we check if the key has changed */
                let changedKey = k.actions.length !== 0;

                /* TODO: Type */
                if (changedKey) {
                    value.delete(k.previous);
                }
                value.set(k.value, v.value);
            }            
        })   
        
        return changes.length > 0 ? {
            actions: changes as NonEmptyArray<RMapAction<K,V>>,
            value
        } : null;
    
        
    });
    
    return resultProp;
};


/* TODO: Create Index Prop */
/* TODO: Types */
const indexFn = (arrSummary: {actions: any[], value: any, previous: any}, index: number) => {
    if (arrSummary.actions.length === 0) {
        return {
            actions: [],
            value: arrSummary.value[index],
            previous: arrSummary.previous[index]
        }
    } else if (arrSummary.actions.length === 1 && arrSummary.actions[0][0] === 'SET') {
        return {
            actions: [['SET', arrSummary.value[index]]],
            value: arrSummary.value[index],
            previous: arrSummary.previous[index]
        }
    /* Multiple actions fired */        
    } else {
        /* TODO: Type, extract from RAAction */
        let result: any;
        arrSummary.actions.forEach(action => {
            if (action[0] === 'SET_KEY' && action[1][0] === index) {
                result = {
                    actions: [['SET', arrSummary.value[index]]],
                    value: arrSummary.value[index],
                    previous: arrSummary.previous[index]
                }
            // } else if (action[0] === 'SET_KEY_INNER') {
            //     return {
            //         actions: [['SET_KEY', arrSummary.value[index]]],
            //         value: arrSummary.value[index]
            //     }
            } else if (action[0] === 'DELETE_KEY') {
                result = {
                    actions: [['SET', undefined]],
                    value: undefined,
                    previous: arrSummary.previous[index]
                }
            }
        })
        return result;
    }
} 