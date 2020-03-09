import { ReactiveInputsArray, ListenFnInputs, ListenerApi, GlobalListener } from '../types';
import { ReactiveDataStore } from './reactive-data-store';

export function createLocalListener<K extends ReactiveInputsArray>(rds: ReactiveDataStore, d: K, lFn: (p: ListenFnInputs<K>) => void) {
    let deps = d as K;
    /* TODO: Add globalSummary as second parameter */
    let apiObject: ListenerApi<K> = {
        fn: lFn,
        deps
    };
    /* 
    Create a dependency -> listener mapping for each dependency provided.
    That way when a dependency changes, we can mark all of its listeners to run.
    */
    deps.forEach(dep => {
        const safeSet = (rds.listenersList.get(dep) || new Set<ListenerApi<K>>());
        rds.listenersList.set(dep, safeSet.add(apiObject));
    });
    return {
        clear: () => {
            deps.forEach(dep => {
                const depListeners = rds.listenersList.get(dep);
                depListeners.delete(apiObject);
                /* Remove key if no more listeners registered (allows for Garbage Collection) */
                if (depListeners.size === 0) {
                    rds.listenersList.delete(dep);
                }
            });
        }
    };
}

export function createGlobalListener(rds: ReactiveDataStore, listenFn: GlobalListener) {
    rds.globalListenersList.add(listenFn);
    return {
        clear: () => {
            rds.globalListenersList.delete(listenFn);
        }
    };
}