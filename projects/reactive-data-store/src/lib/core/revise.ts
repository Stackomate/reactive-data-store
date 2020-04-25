import { ReactiveDataStore } from './reactive-data-store';
import { execOptions, ResolutionOrderArray } from '../types';
import { ReactiveInputsArray, AnyReactiveNode } from "../types-base";
import { ListenerApi } from "../types-listeners";
import { yieldForEach } from '../reusable/yield-for-each';
import { idToObject } from './ids';
import { convertReviewedToSummaries } from './convert-reviewed-to-summaries';
import { PropNode } from './classes';

export function *revise(rds: ReactiveDataStore, options: execOptions) {
    rds.isRevising = true;
    /* First, propagate new state values to all changed properties */
    yield* yieldForEach(rds.dirtyNodes, rds.propagateStateChange.bind(rds, options));
    /* Now, starting from props level 1, iterate*/
    let propsLevel = 1;
    while (propsLevel < rds.sorted.length) {
        yield* yieldForEach(rds.sorted[propsLevel] as Set<PropNode<any, any, any>>, rds.maybeEvaluateProp.bind(rds, options));
        propsLevel++;
    }
    const selectedListeners = new Set<ListenerApi<ReactiveInputsArray>>();
    /* Finally, apply all changes */
    rds.reviewed.forEach((v, k) => {
        const reactiveNode = k;
        /* Update the value in the node */
        reactiveNode.value = v.value;
        /* Locate every listener supposed to be triggered */
        /* TODO: Avoid creating new set */
        const nodeListeners = rds.listenersList.get(reactiveNode) || new Set();
        nodeListeners.forEach(listener => {
            selectedListeners.add(listener);
        });
    });
    rds.isRevising = false;
    rds.currentItem = null;
    /* TODO: No need to copy ? Performance impact */
    let cachedReviewed = convertReviewedToSummaries(rds.reviewed, rds.subscriptionModifications);
    /* Using new Set in order to copy */
    let cachedAddedNodes = new Set(rds.addedNodes);
    /* AddedNodes do not need to be added because they are already in cachedReviewed */
    /* TODO: removedNodes should be map */
    let cachedRemovedNodes = new Set(rds.removedNodes);
    rds.reviewed.clear();
    rds.addedNodes.clear();
    rds.removedNodes.clear();
    rds.toReview.clear();
    rds.dirtyNodes.clear();
    rds.subscriptionModifications.clear();
    rds.triggerListeners(rds.listeners.onReset, []);
    /* TODO: Merge arguments (actions, value, previousValue) to look like globalNodeSummary */
    /* TODO: Only run if dependencies changed */
    selectedListeners.forEach(listener => {
        listener.fn(listener.deps.map(dep => {
            return cachedReviewed.get(dep);
        }));
    });
    /* Get all necessary info for global listeners */
    /* TODO: Improve this */
    let reviewedItems = [...cachedReviewed].map(([k]) => k);
    let checkedNodes = new Set(reviewedItems);
    /* TODO: Use incremental set instead of filtering checkedNodes;
    Don't forget to cleanup reference after transaction is complete */
    /* TODO: Should it include added nodes? */
    let changedNodes = new Set(reviewedItems.filter(i => cachedReviewed.get(i).pushed === true));
    /* TODO: Add ErroredNodes */
    let erroredNodes: Set<AnyReactiveNode> = new Set();
    /* TODO: Implement errored functionality */
    let status: 'SUCCESS' | 'ERROR' = 'SUCCESS';
    let resolutionOrder: ResolutionOrderArray = rds.sorted;
    /* Run all global listeners */
    const listenerSummary = {
        summaries: cachedReviewed,
        checkedNodes,
        changedNodes,
        addedNodes: cachedAddedNodes,
        removedNodes: cachedRemovedNodes,
        erroredNodes,
        allNodes: rds.allNodes,
        status,
        resolutionOrder
    };
    rds.globalListenersList.forEach(listener => {
        listener(listenerSummary);
    });
}