import { LooseNodeSummary, ResolutionOrderArray, SummaryMap } from './types';
import { AnyReactiveNode, ReactiveNode, ReactiveInputsArray } from "./types-base";
/**
 * For Each input, Find the NodeSummary
 */
export type ListenFnInputs<K extends AnyReactiveNode[]> = {
    [P in keyof K]: LooseNodeSummary<K[P]>;
};
/**
 * Object Type used to track local listeners.
 * Contains ReactiveInputsArray as dependencies,
 * and a function with first argument as array that maps to the summary of each dependency.
 */
export type ListenerApi<K extends ReactiveNode<any, any, any>[]> = {
    fn: (p: ListenFnInputs<K>) => void;
    deps: ReactiveInputsArray;
};

export type globalSummary = {

    summaries: SummaryMap 
    /** Any nodes that have been marked as dirty */
    checkedNodes: Set<AnyReactiveNode>,

    /** Nodes that have been checked and returned at least one action */
    changedNodes: Set<AnyReactiveNode>,

    /** Nodes that have been added to the Store during the transaction */
    addedNodes: Set<AnyReactiveNode>,

    /** Nodes that have been removed from the store during the transaction */
    removedNodes: Set<AnyReactiveNode>,

    /** Nodes that have thrown an error during the transaction */
    erroredNodes: Set<AnyReactiveNode>,

    /** All nodes in the Store */
    allNodes: Set<AnyReactiveNode>,

    /** Whether all nodes succeeded. If not, should rollback transaction */
    status: 'SUCCESS' | 'ERROR',

    /** Give the topological sort for the graph resolution. */
    resolutionOrder: ResolutionOrderArray
}

export type GlobalListener = (globalSummary: globalSummary) => void;


export type listenReturn = {
    /** Removes the current listener from Reactive Data Store */
    clear: () => void;
}

/** Types for triggers */
export type innerListenersDeclaration = {
    onCancelChange: (node: AnyReactiveNode) => void;
    onAddChange: <Value>(node: AnyReactiveNode, value: Value) => void;
    markPropDirty: (node: AnyReactiveNode) => void;
    markStateAsCurrent: (node: AnyReactiveNode) => void;
    evaluatedProperty: <Value>(node: AnyReactiveNode, changed: boolean, result: Value) => void;
    onReset: () => void;
}

export type listenersDeclaration = {
    onCancelChange?: innerListenersDeclaration['onCancelChange'][];
    onAddChange?: innerListenersDeclaration['onAddChange'][];
    markPropDirty?: innerListenersDeclaration['markPropDirty'][];
    markStateAsCurrent?: innerListenersDeclaration['markStateAsCurrent'][];
    evaluatedProperty?: innerListenersDeclaration['evaluatedProperty'][];
    onReset?: innerListenersDeclaration['onReset'][];
}

