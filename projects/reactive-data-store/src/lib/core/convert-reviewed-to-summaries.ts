import { PropNode, StateNode } from './classes';
import { NodeSummary, SubscriptionModificationsMap, SummaryMap, reviewedMap } from '../types';
import { idToObject } from './ids';
import { getSubscriptionChanges } from "./get-subscription-changes";
/* TODO: Types */
export function convertReviewedToSummaries(reviewed: reviewedMap, subscriptionModifications: SubscriptionModificationsMap) {
    let result: SummaryMap = new Map();
    reviewed.forEach((summary, key) => {
        /* key in reviewed is a number */
        const item = idToObject(`${key}`);
        /* TODO: Maybe remove any */
        let summaryResult: NodeSummary<any> = summary.pushed === true ? {
            value: summary.value,
            /* TODO: Fix */
            dependencyChanges: summary.dependencyChanges,
            previousValue: summary.previousValue,
            /* TODO: State does not have subsChanges */
            subscriptionChanges: getSubscriptionChanges(item, subscriptionModifications),
            pushed: summary.pushed,
            error: null,
            actions: summary.actions,
            isStateNode: item instanceof StateNode,
            isPropNode: item instanceof PropNode
        } : {
                value: summary.value,
                previousValue: summary.previousValue,
                /* TODO: Fix */
                dependencyChanges: summary.dependencyChanges,
                /* TODO: State does not have subsChanges */
                subscriptionChanges: getSubscriptionChanges(item, subscriptionModifications),
                pushed: false,
                error: null,
                actions: [],
                isStateNode: item instanceof StateNode,
                isPropNode: item instanceof PropNode
            };
        result.set(item, summaryResult);
    });
    return result;
}
