import { SubscriptionChanges, AnyReactiveNode, ChangesSummary, ReactiveNode } from '../types';

 type PushReturn<V> = {
     actions: [['SET', V]],
     value: V
 };
/**
 * Compare current and previous values using Javascript equality operator ===.
 * If changed, return SET action with current value.
 * Else, return null.
 * @param value 
 * @param previous 
 */
export const pushIfChanged = <T>(value: T, previous: T) : PushReturn<T> => {
    return value !== previous ? pushChange(value) : null;
}

/**
 * Shortcut for returning a SET action with the value, as well as the value itself.
 * @param value 
 */
export const pushChange = <T>(value: T) : PushReturn<T> => {
    return {
        actions: [['SET', value]],
        value
    }
}

/* TODO: Maybe separate into different items */
/* TODO: Improve type, narrow down Reactive node type */
export const propUtils = (inputs: ChangesSummary<ReactiveNode<any, any, any>>[], subs: SubscriptionChanges) => ({
    onInitSelf: (fn: () => void) => {
      if (subs.isInit === true) {
          fn();
      }  
    },
    /* TODO: Improve fn types */
    forRemoved: (fn: (node: AnyReactiveNode, index: number) => void) => {
        if (subs.removed.size > 0) {
            /* TODO: Need to specify removedNode type */
            subs.removed.forEach((removedNode: ReactiveNode<number, any, any>, index) => {
                fn(removedNode, index);
            })
        }        
    },

    forAdded: (fn: (node: AnyReactiveNode, index: number) => void) => {
        if (subs.added.size > 0) {
            /* TODO: Need to specify removedNode type */
            subs.added.forEach((addedNode: ReactiveNode<number, any, any>, index) => {
                fn(addedNode, index);
            })
        } 
    },
    /* TODO: Maybe improve performance by using closure */
    /* TODO There should be a samewithchanges map in subscription changes, for better performance */
    forSameWithChanges: (fn: (node: ChangesSummary<AnyReactiveNode>, index: number) => void) => {
        let changedIndexes = new Set<number>();

        inputs.forEach((value, index) => {
            if ((subs.added.has(index) === false) && (subs.removed.has(index) === false)) {
                /* Check if input emitted action */
                if (value.actions.length > 0) {
                    changedIndexes.add(index);
                }
            }
        })

        changedIndexes.forEach(i => {
            fn(inputs[i], i);
        })
    },

    /* Probably not necessary*/
    // forReplaced: () => {}
    // forRemovedOnly
    // forAddedOnly
})