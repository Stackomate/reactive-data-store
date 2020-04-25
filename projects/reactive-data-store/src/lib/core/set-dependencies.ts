import { PropNode, StateNode } from './classes';
import { ReactiveNode } from "../types-base";
import { idGenFn } from './ids';
import { toposort } from './utils';
import { ReactiveDataStore } from './reactive-data-store';

export function setDependencies(rds: ReactiveDataStore, target: PropNode<any, any, any>, index: number, dep: ReactiveNode<any, any, any>) {
        let lastInput = target.inputs[index];
        /* Remove if there was previous */
        if (lastInput !== undefined) {
            rds.removeDependencies(target, [`${index}`]);
        }
        /* TODO: Combine with addDependencies */
        target.inputs[index] = dep;
        dep.outputs.add(target);
        if (rds.allNodes.has(dep) === false) {
            if (dep instanceof StateNode) {
                rds.addChange(dep, dep.value);
            }
            rds.addedNodes.add(dep);
        }
        rds.allNodes.add(dep);
        /* Copied from addDependencies, with 1 CHANGE */
        /* Re-sort all nodes */
        /* TODO: Can be optimized for some cases */
        rds.sorted = toposort(rds.allNodes);
        /* Mark target dependency as dirty */
        rds.toReview.add(target);
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
        /* CHANGE IS HERE! */
        addedMap.set(index, dep);
        /* This gets cleaned up after all changes are commited */
        rds.subscriptionModifications.set(target, {
            added: addedMap,
            removed: oldTargetModifications.removed,
            /* TODO: Might need improvement here */
            isInit: false
        });
    }
