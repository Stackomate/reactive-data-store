import { AnyReactiveNode } from "../types-base";
import { StateNode } from './classes';
import { ReactiveDataStore } from './reactive-data-store';
import { getAllNodes, toposort } from './utils';
import { listenersDeclaration } from '../types-listeners';

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
            rds.addChange(n, n.value);
        }
    });
    rds.revise({
        debug: false
    }).next();
    rds.isFirstRun = false;
}
