import { AnyReactiveNode, ArrayIndexes, execOptions, GlobalListener, innerListenersDeclaration, ListenerApi, listenersDeclaration, ListenFnInputs, listenReturn, ReactiveInputsArray, reviewedMap, SubscriptionModificationsMap } from '../types';
import { addDependencies } from './add-dependencies';
import { PropNode } from './classes';
import { idGenFn } from './ids';
import { initRDS } from './init-rds';
import { createGlobalListener, createLocalListener } from './listeners';
import { maybeEvaluateProp } from './maybe-evaluate-prop';
import { propagateStateChange } from './propagate-state-change';
import { removeDependencies } from './remove-dependencies';
import { revise } from './revise';
import { setDependencies } from './set-dependencies';
import { setForTransaction } from './set-for-transaction';
import { toposort } from './utils';
/* TODO: Add generics */
/* TODO: 
    * Perhaps use object instead of array for inputChanges in propFn. Or Set/Map (Probably not)
    * Subscription Changes can have shifted, spliced, etc
    * Convert input array to map/object for remote connections. 
*/

/**
 * Class Responsible for holding the entire State and Prop Nodes, as well as Transaction information.
 * Use it to encapsulate, kickstart and manage your application state.
 */
export class ReactiveDataStore {

    /* LISTENER-RELATED */
    /** Set of registered global listener functions  */
    public globalListenersList = new Set<GlobalListener>();
    /** 
     * Map of Reactive Nodes and their respective listeners (fn + deps) registered. 
     * One listener may be marked to run by many different nodes, 
     * but will only run once.
     **/
    public listenersList = new Map<AnyReactiveNode, Set<ListenerApi<ReactiveInputsArray>>>();
    /**
     * Create a global listener or local listener.
     * @optional @param deps Filter listener for only the specified ReactiveNodes. Will create a localListener. 
     * @param listenFn Function to be run during trigger. This is a good place to add side-effects, e.g.: update DOM, make AJAX calls, etc.
     */
    /* TODO: Create listen function that links to nodes instead */
    listen(listenFn: GlobalListener): listenReturn;
    listen<K extends ReactiveInputsArray>(deps: K, listenFn: (p: ListenFnInputs<K>) => void): listenReturn;
    listen<K extends ReactiveInputsArray>(d: (K | GlobalListener), lFn?: (p: ListenFnInputs<K>) => void): listenReturn {
        /* If is global listener */
        if (!lFn) {
            return createGlobalListener(this, d as GlobalListener);
        }

        /* Else If is local listener, register listener for each input */
        return createLocalListener<K>(this, d as K, lFn);
    }
    /* TODO: Typing */
    public triggerListeners<B extends Array<any>>(listenersArray: Array<(...args: B) => void>, args: B): void {
        listenersArray.forEach(l => {
            l.apply(this, args);
        });
    }
    /* TODO: Use Symbols, improve typing */
    public addListener<KeyName extends keyof listenersDeclaration>(key: KeyName, fn: innerListenersDeclaration[KeyName]) {
        const listenerArray = this.listeners[key] as listenersDeclaration[KeyName];
        /* TODO: Fix later */
        (listenerArray as any).push(fn);
    }
    /* TODO: Typing */
    public listeners: listenersDeclaration = {
        onCancelChange: [],
        onAddChange: [],
        markPropDirty: [],
        markStateAsCurrent: [],
        evaluatedProperty: [],
        onReset: []
    };    


    /* INFORMATION-RELATED */
    /**
     * Contains all the reachable nodes in the graph.
     */
    public allNodes: Set<AnyReactiveNode>;
    /**
     * Contains Nodes ordered in a topological manner.
     * Each array item is a level, each level contains a Set of Nodes.
     */
    public sorted: Array<Set<AnyReactiveNode>>;
    /** Whether state and props are being revised */
    public isRevising = false;
    /* TODO: Improve type */
    /**
     * Map With the Nodes that have been reviewed and their "Primary"/Temporary Result
     */
    public reviewed: reviewedMap = new Map();
    /** A Set of Prop Ids yet to be reviewed */
    public toReview: Set<number> = new Set();

    /* TODO: Only allow adding/removing nodes inside a transaction */
    /** A Set of Nodes that have been added to the graph since the last transaction */
    public addedNodes: Set<AnyReactiveNode> = new Set();
    /** A Set of Nodes that have been removed from the graph since the last transaction */
    public removedNodes: Set<AnyReactiveNode> = new Set();

    /* TODO: Use pairset, add types */
    /**
     * Contains a Map of Nodes and their respective SubscriptionModifications since the last transaction
     */
    public subscriptionModifications: SubscriptionModificationsMap = new Map();
    /**
     * Contains a Map with the corresponding Starting State Node IDs (Number) and their respective next values.
     */
    /* TODO: Does it include props too ? */
    public dirtyNodes: Map<number, any> = new Map<number, any>();
    /* Current item id of item being reviewed */
    public currentItem: number;
    /* Only true when initializing the RDS */
    public isFirstRun: boolean = true;


    /* TODO: Avoid using "index as number", and allow for numbers in indexes only.
    (Currently only accepting strings)  
    */
   /**
    * Remove dependency connections in a PropNode. 
    * Delete the given indexes by replacing the item with empty, preserving the input array's length.
    * @param target PropNode that will have one or more inputs removed
    * @param indexes An array of indexes (strings) that 
    */
    public removeDependencies<I extends ReactiveInputsArray, J extends ArrayIndexes<I>>(target: PropNode<any, I, any>, indexes: Array<J>) {
        removeDependencies<I, J>(this, indexes, target);
    }

    /* TODO: Narrow down type */
    public setDependency(target: PropNode<any, any, any>, index: number, dep: AnyReactiveNode) {
        setDependencies(this, target, index, dep);
    }

    /* TODO: Types */
    public addDependencies(target: PropNode<any, any, any>, deps: AnyReactiveNode[]) {
        addDependencies(this, target, deps);
    }

    constructor(public entry: Array<AnyReactiveNode>,
        /* TODO: Typing */
        listeners: listenersDeclaration = {},
        initialize: boolean = true) {
        initRDS(this, entry, listeners);
    }

    /**
     * Check whether a State Node has been marked for change.
     * @param n State Node Id.
     */
    markedForChange(n: number): boolean {
        return this.dirtyNodes.has(n);
    }

    /**
     * Revoke change added to the provided State Node.
     * @param nodeId
     */
    cancelChange(nodeId: number): void {
        this.dirtyNodes.delete(nodeId);
        this.triggerListeners(this.listeners.onCancelChange, [nodeId]);
    }
    /* TODO: Use object instead of id */
    /**
     * Enqueue a new change operation to a node.
     * @param n Node id
     * @param value
     */
    addChange<M>(n: number, value: M): void {
        /* TODO: Forbid if n = propId */
        this.dirtyNodes.set(n, value);
        this.triggerListeners(this.listeners.onAddChange, [n, value]);
    }
    *markForCheck(options: execOptions, output: PropNode<any, any, any>): Generator {
        let propId = idGenFn(output);
        this.currentItem = propId;
        this.triggerListeners(this.listeners.markPropDirty, [propId]);
        this.toReview.add(propId);
        if (options.debug === true)
            yield;
    }
    *propagateStateChange(options: execOptions, i: [number, any]) {
        yield* propagateStateChange(this, i, options);
    }
    *maybeEvaluateProp<A extends any, B extends ReactiveInputsArray, C extends [string, any]>(options: execOptions, prop: PropNode<A, B, C>) {
        yield* maybeEvaluateProp<A, B, C>(this, prop, options);
    }

    /* TODO: Use trigger onAppend on nodes instead */
    appendNode(node: AnyReactiveNode) {
        this.allNodes.add(node);
        this.sorted = toposort(this.allNodes);
    }
    *revise(options: execOptions) {
        yield* revise(this, options);

        /* Call the listeners with the specified summary */
    }

    public transaction(fn: (set: typeof setForTransaction) => void) {
        fn(setForTransaction.bind(this));

        let r = this.revise({
            debug: false
        }).next();
    }

    run(): void {
        this.revise({
            debug: false
        }).next();
    }

    public setForTransaction = setForTransaction.bind(this)
}

