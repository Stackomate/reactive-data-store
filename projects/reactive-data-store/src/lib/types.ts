import { StateNode, PropNode, State } from './core/classes';
import { DefaultActionTuple } from './types-actions';
import { ReactiveInputsArray, AnyReactiveNode } from './types-base';
import { InputTypeOfNode, ActionsOf, ValueOf, ValuesOfInputs } from './types-extractors';
import { NonEmptyArray } from './types-general';


/* Related to PropFn type */

/**
 * Contains the changes that have been made on the input subscription.
 */
export type SubscriptionChanges<M = AnyReactiveNode> = {
    /* TODO: (LOW) Narrow down input types. Use custom map interface? */
    added: Map<number, InputTypeOfNode<M>>,
    removed: Map<number, InputTypeOfNode<M>>,
    /* This currently refers to isFirstRun */
    /* TODO: (MEDIUM) Add option for isItemInit/isStoreInit */
    isInit: boolean,
}

/**
 * Map every input into its Summary of Changes
 */
export type InputsArrayChanges<Inputs extends ReactiveInputsArray> = {
    [P in keyof Inputs]: InputChangesSummary<Inputs[P]>
};

/**
 * The summary of changes object contains actions,
 * the current and previous value for a given Reactive Node.
 * Undefined in case the index does not have a Reactive Node.
 */
export type InputChangesSummary<RNode> = RNode extends AnyReactiveNode ? {
    actions: ActionsOf<RNode>,
    value: ValueOf<RNode>,
    /** If initializing, previous and value will be the same value */
    previous: ValueOf<RNode>,
} : undefined;


/**
 * Object returned when the Prop Object Function runs.
 */
export type PropFnReturn<Value, Actions> = null | {
    actions: NonEmptyArray<Actions>,
    value: Value
}

/** Type for Property Evaluation Function. Should return a summary of changes */
export type PropFn<InputsArray extends ReactiveInputsArray, Value, Actions extends DefaultActionTuple> = (
    inputChanges: InputsArrayChanges<InputsArray>,
    /* This messes up the Value in Prop when it gets declared as a function parameter */
    previousValue: Value,
    subscriptionChanges: SubscriptionChanges<PropNode <Value, InputsArray, Actions> >,
) => PropFnReturn<Value, Actions>



/* TODO: ReviewedNodeResult and nodeSummaryCommons have stuff in common, abstract */
export type ReviewedNodeResult<Value, Inputs extends ReactiveInputsArray, Actions extends DefaultActionTuple> = {
    actions: NonEmptyArray<Actions>,
    value: Value,
    previousValue: Value,
    pushed: true,
    dependencyChanges: {
        [P in keyof Inputs]: InputChangesSummary<Inputs[P]>
    }
} | {
    value: Value,
    previousValue: Value,
    pushed: false,
    actions: [],
    dependencyChanges: {
        [P in keyof Inputs]: InputChangesSummary<Inputs[P]>
    }
}

/* TODO: Improve types (any), use generics for node */
type nodeSummaryCommons<N extends AnyReactiveNode> = {
    dependencyChanges: [] | InputsArrayChanges<InputTypeOfNode<N>>, 
    previousValue: ValueOf<N>, 
    value: ValueOf<N>,
    /* TODO: Add generic */
    subscriptionChanges: SubscriptionChanges,
    isStateNode: N extends StateNode<any> ? true: false,
    isPropNode: N extends PropNode<any, any, any> ? true : false
}
type LooseNodeSummaryCommons<N> = {
    dependencyChanges: [] | InputsArrayChanges<InputTypeOfNode<N>>, 
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
    forEach<K extends AnyReactiveNode>(callbackfn: (value: NodeSummary<K>, key: K, map: SummaryMap) => void, thisArg?: any): void;
    get<K extends AnyReactiveNode>(key: K): NodeSummary<K> | undefined;
    has<K extends AnyReactiveNode>(key: K): boolean;
    set<K extends AnyReactiveNode>(key: K, value: NodeSummary<K>): this;
    readonly size: number;

}



export type ResolutionOrderArray = [] | [Set<StateNode<any>>, ...RemainingLevels ];
export type RemainingLevels = Set<PropNode<any, any, any>>[];


/* TODO: Narrow down type? */
export type reviewedMap = Map<AnyReactiveNode, ReviewedNodeResult<any, any, any>>;

/** Type for MapToProp Function */
export type MapFnType<T, M extends ReactiveInputsArray> = (n: ValuesOfInputs<M>) => T;


/** Options for revise method */
export type execOptions = {
    /**
     * If true, will stop generated function in yield breakpoints.
     */
    debug?: boolean
}