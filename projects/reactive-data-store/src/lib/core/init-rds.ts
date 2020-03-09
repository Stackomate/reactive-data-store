import { ReactiveDataStore } from './reactive-data-store';
import { AnyReactiveNode, listenersDeclaration } from '../types';
import { getAllNodes, toposort } from './utils';
import { StateNode } from './classes';
import { idGenFn } from './ids';

export function initRDS(rds: ReactiveDataStore, entry: AnyReactiveNode[], listeners: listenersDeclaration) {
    rds.allNodes = getAllNodes(entry);
    rds.sorted = toposort(rds.allNodes);
    /* Assign listeners to self */
    Object.entries(listeners).forEach(<K extends keyof listenersDeclaration>([key, value]: [K, listenersDeclaration[K]]) => {
        /* TODO: Fix type */
        rds.listeners[key] = value;
    });
    /* Always render state first */
    rds.allNodes.forEach(n => {
        if (n instanceof StateNode) {
            rds.addChange(idGenFn(n), n.value);
        }
    });
    rds.revise({
        debug: false
    }).next();
    rds.isFirstRun = false;
}
