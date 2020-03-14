import { StateNode, PropNode, State } from './core/classes';

/**
 * Contains the changes that have been made on the input subscription arrays.
 */
export type SubscriptionChanges<M = AnyReactiveNode> = {
    /* TODO: (LOW) Narrow down input types. Use custom map interface? */
    added: Map<number, InputsOf<M>>,
    removed: Map<number, InputsOf<M>>,
    /* This currently refers to isFirstRun */
    /* TODO: (MEDIUM) Add option for isItemInit/isStoreInit */
    isInit: boolean,
}

/**
 * Get array of Possible Actions for a given Reactive Node
 */
export type ActionsOf<RNode> = RNode extends StateNode<infer Value> ? ['SET', Value] : (
    RNode extends PropNode<any, any, infer B> ? B : never
);

/**
 * Get type of value for a given Reactive Node
 */
export type ValueOf<RNode> = RNode extends StateNode<infer V> ? V : (
    RNode extends PropNode<infer V, any, any> ? V : never
)

/**
 * Given a PropNode, return the type of its inputs.
 */
export type InputsOf<RNode> = RNode extends PropNode<any, infer I, any> ? I : never;

/**
 * Given an array of Reactive Inputs, map to an array of their values
 */
export type ValuesOfInputs<Inputs extends ReactiveInputsArray> = {
    [P in keyof Inputs]: ValueOf<Inputs[P]>
}

/**
 * The summary of changes object contains actions,
 * the current and previous value for a given Reactive Node
 */
export type ChangesSummary<RNode> = RNode extends AnyReactiveNode ? {
    actions: ActionsOf<RNode>,
    value: ValueOf<RNode>,
    /** If initializing, previous and value will be the same value */
    previous: ValueOf<RNode>,
} : undefined;

/**
 * Get only the index numbers from an array
 */
export type ArrayIndexes<I> = Exclude<keyof I & string, keyof Array<any>>

// https://stackoverflow.com/questions/56006111/is-it-possible-to-define-a-non-empty-array-type-in-typescript/56006703
/**
 * Force an array to have at least one item
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Object returned when the Prop Object Function runs.
 */
export type PropSummaryReturn<Value, Actions> = null | {
    actions: NonEmptyArray<Actions>,
    value: Value
}

/** Type for Property Evaluation Function. Should return a summary of changes */
export type PropFn<InputsArray extends ReactiveInputsArray, Value, Actions> = (
    inputChanges: DependencyChanges<InputsArray>,
    /* This messes up the Value in Prop when it gets declared as a function parameter */
    previousValue: Value,
    subscriptionChanges: SubscriptionChanges,
) => PropSummaryReturn<Value, Actions>

/**
 * Map every input into its Summary of Changes
 */
export type DependencyChanges<Inputs extends ReactiveInputsArray> = {
    [P in keyof Inputs]: ChangesSummary<Inputs[P]>
};

/**
 * This is used to trick IntelliSense into getting the specific types of each input.
 * Just using a ReactiveNode[] will not work for that purpose.
 */
export type ReactiveInputsArray = [AnyReactiveNode | undefined] | (AnyReactiveNode | undefined)[];

/** Type for MapToProp Function */
export type MapFnType<T, M extends ReactiveInputsArray> = (n: ValuesOfInputs<M>) => T;

/** Similar to ReactiveNode, but make sure it contains a certain value type */
export type ReactiveNodeOfValue<T> = StateNode<T> | PropNode<T, any, any>;

/** SET_KEY action type for Reactive Arrays */
export type SET_KEY_ACTION<V> = ['SET_KEY', [number, V]];
export type DELETE_KEY_ACTION<V> = ['DELETE_KEY', number];

/**
 * Allowed Actions for ReactiveArrays
 */
export type SET_KEY_INNER_ACTION<V> = ['SET_KEY_INNER', [number, RAAction<V>[] ]];
export type RAAction<T> = (T extends Array<infer M> ? SET_KEY_INNER_ACTION<M> : never) | SET_KEY_ACTION<T> | ['SET', T[]] | DELETE_KEY_ACTION<T>;

// type SET_MAP_KEY<K> = ['SET_MAP_KEY', [K, K]];
// type SET_MAP_VALUE<K, V> = ['SET_MAP_VALUE', [K, V]];
type DELETE_MAP_PAIR<K> = ['DELETE_MAP_PAIR', K];
type SET_MAP_PAIR<K, V> = ['SET_MAP_PAIR', [MAP_KEY_ACTION<K>, MAP_VALUE_ACTION<V>]];
type MAP_KEY_ACTION<K> = ['SET', K, K] | ['SET_INNER', K, K] | ['KEEP', K];
type MAP_VALUE_ACTION<V> = ['SET', V] | ['SET_INNER', V] | ['KEEP'];
export type RMapAction<K, V> = ['SET', Map<K, V>] | /*SET_MAP_KEY<K> | SET_MAP_VALUE<K, V> |*/ DELETE_MAP_PAIR<K> | SET_MAP_PAIR<K, V>;
/**
 * For Each input, Find the NodeSummary
 */
export type ListenFnInputs<K extends AnyReactiveNode[]> = {
    /* Necessary to use Extract here: https://github.com/microsoft/TypeScript/issues/23724 */
    // [P in Extract<keyof K, number>]:  NodeSummary<K[P]>;
    [P in keyof K]: LooseNodeSummary<K[P]>;
}


/**
 * Object Type used to track local listeners.
 * Contains ReactiveInputsArray as dependencies, 
 * and a function with first argument as array that maps to the summary of each dependency.
 */
export type ListenerApi<K extends ReactiveNode<any, any, any>[]> = {
    fn: (p: ListenFnInputs<K>) => void,
    deps: ReactiveInputsArray
};

/** A Reactive Node is either a Prop or State */
export type ReactiveNode<
    Value,
    Actions extends [string, any],
    Inputs extends ReactiveInputsArray
    > = PropNode<Value, Inputs, Actions> | StateNode<Value>;

export type AnyReactiveNode = ReactiveNode<any, any, any>;

/** Options for revise method */
export type execOptions = {
    /**
     * If true, will stop generated function in yield breakpoints.
     */
    debug?: boolean
}

/** A Set that contains Reactive Nodes */
export type NodeSetType = Set<AnyReactiveNode>;


/** Types for triggers */
export type innerListenersDeclaration = {
    onCancelChange: (nodeId: number) => void;
    onAddChange: <Value>(nodeId: number, value: Value) => void;
    markPropDirty: (nodeId: number) => void;
    markStateAsCurrent: (nodeId: number) => void;
    evaluatedProperty: <Value>(nodeId: number, changed: boolean, result: Value) => void;
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

/* TODO: Improve type */
export type ReviewedNodeResult<Value, Actions extends [string, any]> = {
    actions: NonEmptyArray<Actions>,
    value: Value,
    previousValue: Value,
    pushed: true,
    /* TODO: Fix type */
    dependencyChanges: any[]
} | {
    value: Value,
    previousValue: Value,
    pushed: false,
    actions: [],
    dependencyChanges: any[]
}

/* TODO: Improve types (any), use generics for node */
type nodeSummaryCommons<N extends AnyReactiveNode> = {
    dependencyChanges: [] | DependencyChanges<InputsOf<N>>, 
    previousValue: ValueOf<N>, 
    value: ValueOf<N>,
    /* TODO: Add generic */
    subscriptionChanges: SubscriptionChanges,
    isStateNode: N extends StateNode<any> ? true: false,
    isPropNode: N extends PropNode<any, any, any> ? true : false
}
type LooseNodeSummaryCommons<N> = {
    dependencyChanges: [] | DependencyChanges<InputsOf<N>>, 
    previousValue: ValueOf<N>, 
    value: ValueOf<N>,
    subscriptionChanges: SubscriptionChanges<N>,
    isStateNode: N extends StateNode<any> ? true: false,
    isPropNode: N extends PropNode<any, any, any> ? true : false
}

/* TODO: Improve types */
export type SubscriptionModificationsMap = Map<PropNode<any, any, any>, SubscriptionChanges>;

export interface LooseNodePushedSummary<N> extends LooseNodeSummaryCommons<N> {
    actions: NonEmptyArray<ActionsOf<N>>,
    pushed: true,
    error: null | Error    
}
export interface NodePushedSummary<N extends AnyReactiveNode> extends nodeSummaryCommons<N> {
    actions: NonEmptyArray<ActionsOf<N>>,
    pushed: true,
    error: null | Error
}

export interface NodeSameSummary<N extends AnyReactiveNode> extends nodeSummaryCommons<N> {
    pushed: false,
    actions: [],
    error: null | Error
}
export interface LooseNodeSameSummary<N> extends LooseNodeSummaryCommons<N> {
    pushed: false,
    actions: [],
    error: null | Error
}

export type NodeSummary<N extends AnyReactiveNode> = NodePushedSummary<N> | NodeSameSummary<N>;
export type LooseNodeSummary<N> = LooseNodePushedSummary<N> | LooseNodeSameSummary<N>;

/**
 * This is a stricter interface than native Map interface that Typescript uses.
 * With this, it's possible to derive the value type from the key type
 */
/* TODO: Generalize type (not only summaries) */
export interface SummaryMap extends Map<any, any> {
    clear(): void;
    delete<K>(key: K): boolean;
    /* TODO: Fix */
    forEach<K extends AnyReactiveNode>(callbackfn: (value: NodeSummary<K>, key: K, map: SummaryMap) => void, thisArg?: any): void;
    get<K extends AnyReactiveNode>(key: K): NodeSummary<K> | undefined;
    has<K extends AnyReactiveNode>(key: K): boolean;
    set<K extends AnyReactiveNode>(key: K, value: NodeSummary<K>): this;
    readonly size: number;

}

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

    /* TODO: Level 0 is state-only */
    /** Give the topological sort for the graph resolution. */
    resolutionOrder: ResolutionOrderArray
}

export type ResolutionOrderArray = [] | [Set<StateNode<any>>, ...RemainingLevels ];
export type RemainingLevels = Set<PropNode<any, any, any>>[];

export type GlobalListener = (globalSummary: globalSummary) => void;


export type listenReturn = {
    /** Removes the current listener from Reactive Data Store */
    clear: () => void;
}

/* TODO: Improve type */
export type reviewedMap = Map<number, ReviewedNodeResult<any, any>>;