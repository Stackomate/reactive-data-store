import { ReactiveDataStore } from './reactive-data-store';
import { execOptions } from '../types';
import { idToObject } from './ids';
import { yieldForEach } from '../reusable/yield-for-each';

export function *propagateStateChange(rds: ReactiveDataStore, i: [number, any], options: execOptions) {
    rds.currentItem = i[0];
    rds.triggerListeners(rds.listeners.markStateAsCurrent, [i[0]]);
    if (options.debug === true)
        yield;
    /* Grab item by id */
    let item = idToObject(`${i[0]}`);
    /* Mark each one of state dependants for check */
    yield* yieldForEach(item.outputs, rds.markForCheck.bind(rds, options));
    /* Remove self from dirtyNodes and add to reviewed */
    rds.dirtyNodes.delete(i[0]);
    rds.reviewed.set(i[0], {
        actions: [['SET', i[1]]],
        value: i[1],
        pushed: true,
        previousValue: item.value,
        /* State never has dependency changes */
        dependencyChanges: []
    });
    if (options.debug === true)
        yield;
}