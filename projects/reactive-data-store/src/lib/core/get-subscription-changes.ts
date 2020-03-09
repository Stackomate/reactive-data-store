import { StateNode } from './classes';
import { AnyReactiveNode, SubscriptionModificationsMap } from '../types';
/* TODO: Add Specific subscription modification types (narrow down) */
export function getSubscriptionChanges(item: AnyReactiveNode, subscriptionModifications: SubscriptionModificationsMap) {
    if (item instanceof StateNode) {
        return null;
    }
    return subscriptionModifications.has(item) ? subscriptionModifications.get(item) : null;
}
