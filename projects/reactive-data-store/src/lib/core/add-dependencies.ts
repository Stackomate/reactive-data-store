import { PropNode, StateNode } from './classes';
import { ReactiveNode } from '../types';
import { idGenFn } from './ids';
import { toposort } from './utils';
import { ReactiveDataStore } from './reactive-data-store';

export function addDependencies(rds: ReactiveDataStore, target: PropNode<any, any, any>, deps: ReactiveNode<any, any, any>[]) {
    let lastTargetInputsLength = target.inputs.length;
    /* Add inputs to target */
    /* TODO: Tried immutable, but that changes the reference for input array inside function.
    Instead, have a feature to rollback the input array on error */
    for (let input of deps) {
        target.inputs.push(input);
    }
    /* Add target as output for each new input */
    deps.forEach(dep => {
        dep.outputs.add(target);
    });
    /* Similar to code in ctor */
    /* Update all nodes to contain new deps, in case they're not registered yet*/
    deps.forEach(dep => {
        /* TODO: Abstract with ctor code */
        /* If dependency is not registered in RDS yet */
        if (rds.allNodes.has(dep) === false) {
            if (dep instanceof StateNode) {
                rds.addChange(idGenFn(dep), dep.value);
            }
            rds.addedNodes.add(dep);
        }
        /* TODO: Make work both for state and props */
        /* TODO: Dependencies and indirect dependencies might not have been initialized yet! */
        rds.allNodes.add(dep);
    });
    /* Re-sort all nodes */
    /* TODO: Can be optimized for some cases */
    rds.sorted = toposort(rds.allNodes);
    /* Mark target dependency as dirty */
    rds.toReview.add(idGenFn(target));
    /* TODO: Recreating maps during every new change, this can be optimized with one mutable instance */
    let oldTargetModifications = rds.subscriptionModifications.get(target) || {
        added: new Map(),
        removed: new Map(),
        /* TODO: Fix this, use isInit for specific node, isRDSInit for store */
        isInit: false
    };
    /* add target to subscription changes */
    /* TODO: extends inner subscription change to avoid losing data */
    const addedMap = oldTargetModifications.added;
    deps.forEach((dep, i) => {
        addedMap.set(i + lastTargetInputsLength, dep);
    });
    /* This gets cleaned up after all changes are commited */
    rds.subscriptionModifications.set(target, {
        added: addedMap,
        removed: oldTargetModifications.removed,
        /* TODO: Might need improvement here */
        isInit: false
    });
}
