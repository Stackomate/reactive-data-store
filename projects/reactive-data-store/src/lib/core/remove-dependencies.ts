import { ReactiveInputsArray, ArrayIndexes } from '../types';
import { idGenFn } from './ids';
import { PropNode } from './classes';
import { ReactiveDataStore } from './reactive-data-store';

export function removeDependencies<I extends ReactiveInputsArray, J extends ArrayIndexes<I>>(rds: ReactiveDataStore, indexes: J[], target: PropNode<any, I, any>) {
    indexes.forEach((index) => {
        let input = target.inputs[index as number];
        /* remove input from target's inputs */
        /* TODO: Use null or undefined here? */
        target.inputs[index] = undefined;
        /* Update array length */
        /* TODO: Fix edge cases */
        /* TODO: Abstract (index as number) */ 
        // if ((index as number) + 1 === target.inputs.length){
        //     target.inputs.length = index as number;
        // }
        /* Check whether we can remove target from input's output set*/
        let canRemoveFromOutput = true;
        /* TODO: Remove type any */
        target.inputs.forEach((ti: any) => {
            if (ti === input) {
                canRemoveFromOutput = false;
            }
        });
        if (canRemoveFromOutput) {
            input.outputs.delete(target);
        }
        /* TODO: Recreating maps during every new change, this can be optimized with one mutable instance */
        let oldTargetModifications = rds.subscriptionModifications.get(target) || {
            added: new Map(),
            removed: new Map(),
            /* TODO: Fix this, use isInit for specific node, isRDSInit for store */
            isInit: false
        };
        /* add target to subscription changes */
        /* TODO: extends inner subscription change to avoid losing data */
        const removedMap = oldTargetModifications.removed;
        indexes.forEach((index) => {
            removedMap.set(index as number, input);
        });
        /* This gets cleaned up after all changes are commited */
        rds.subscriptionModifications.set(target, {
            added: oldTargetModifications.added,
            removed: removedMap,
            /* TODO: Might need improvement here */
            isInit: false
        });
    });
    /* Mark target for revision */
    rds.toReview.add(target);
}