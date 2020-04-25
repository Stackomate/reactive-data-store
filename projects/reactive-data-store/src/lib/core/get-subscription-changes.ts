import { StateNode } from './classes';
import { SubscriptionModificationsMap } from '../types';
import { AnyReactiveNode } from "../types-base";
/* TODO: Add Specific subscription modification types (narrow down) */
export function getSubscriptionChanges(item: AnyReactiveNode, subscriptionModifications: SubscriptionModificationsMap) {
    if (item instanceof StateNode) {
        return null;
    }
    return subscriptionModifications.has(item) ? subscriptionModifications.get(item) : null;
}
