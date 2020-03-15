import { ReactiveInputsArray, AnyReactiveNode, DefaultActionTuple } from '../types';
import { PropFn } from '../types';
import { ReactiveDataStore } from './reactive-data-store';
/* TODO: Combine documentation from factories and Nodes to improve maintainability */
/* TODO: Combine generics from factories and Nodes to improve maintainability */

/**
 * Represents Reactive Information that can mutate over time.
 * @param value Internal Value for StateNode that can be mutated later.
 * @param label Optional Label for debugging purposes
 */
export class StateNode<Value> {
  /** Set of Props that depend on this Node.
   * When actions are pushed from this, the outputs will be notified and marked for check. */
  public outputs = new Set<PropNode<any, AnyReactiveNode[], any>>();
  /**
   * Optional signature for StateNode.
   * Currently has to be modified directly by the constructor.
   */
  public signature: string | symbol;

  /**
   * Store Instance to which this Node is connected.
   * The instance should act as a singleton for all ReactiveNodes.
   */
  public storeInstance: ReactiveDataStore;

  /* TODO: (LOW) Maybe use pairSet to specify both target prop and target input index*/
  /**
   * Add Prop to Outputs Set
   * @param prop 
   */
  public connectFrom(prop: PropNode<any, AnyReactiveNode[], any>) {
    this.outputs.add(prop);
  }

  constructor(public value: Value, public label?: string) {

  }

}


/**
 * Represents Derived Reactive Information.
 * @param inputs Reactive dependencies (State and Prop nodes) required to be resolved before this node.
 * May be initialized as empty array, then later added dynamically.
 * @param fn Function responsible for computing resulting Actions and Value.
 * @param api Object with list of optional commands for the PropNode (for example, `.set()` method)
 * @param label Optional Label for debugging purposes 
 */
export class PropNode<Value, Inputs extends ReactiveInputsArray, Actions extends DefaultActionTuple> {

  /** Internal value that is calculated by the provided function. */
  public value: Value;

  /**
   * Store Instance to which this Node is connected.
   * The instance should act as a singleton for all ReactiveNodes.
   */
  public storeInstance: ReactiveDataStore;

  /**
   * Optional signature for StateNode.
   * Currently has to be modified directly by the constructor.
   */
  public signature: string | symbol;

  constructor(
    public inputs: Inputs,
    public fn: PropFn<Inputs, Value, Actions>,
    public api: Record<string, any> = {},
    public label?: string,
  ) {
    inputs.forEach((input, index) => {
      /* It's possible to initialize empty input slots (with undefined). 
      In that case, do not connect. */
      if (input === undefined) return;
      /* Otherwise, connect to State/Prop */
      input.connectFrom(this, index);
    })
  }

  /** Set of Props that depend on this Node.
   * When actions are pushed from this, the outputs will be notified and marked for check. */
  public outputs = new Set<PropNode<any, any, any>>();

  /**
   * Add Prop to Outputs Set
   * @param prop 
   */
  public connectFrom(prop: PropNode<any, ReactiveInputsArray, any>, index: number) {
    this.outputs.add(prop);
  }

}


/**
 * Factory Function for a StateNode.
 * @param value Internal Value for StateNode that can be mutated later.
 * @param label Optional Label for debugging purposes
 */
export function State<Value>(value: Value, label?: string) {
  return new StateNode(value, label);
}

/**
 * Factory Function for a PropNode.
 * @param inputs Reactive dependencies (State and Prop nodes) required to be resolved before this node.
 * May be initialized as empty array, then later added dynamically.
 * @param fn Function responsible for computing resulting Actions and Value.
 * @param api Object with list of optional commands for the PropNode (for example, `.set()` method)
 * @param label Optional Label for debugging purposes 
 */
export function Prop<
  Value,
  Actions extends DefaultActionTuple,
  Inputs extends ReactiveInputsArray
>(
  inputs: Inputs,
  fn: PropFn<Inputs, Value, Actions>,
  api: Record<string, any> = {},
  label?: string
) {
  return new PropNode(inputs, fn, api, label)
}

/** Alternate constructor for PropNode that allows for better type definitions.
 * @param inputs Reactive dependencies (State and Prop nodes) required to be resolved before this node.
 * May be initialized as empty array, then later added dynamically.
 * @param fn Function responsible for computing resulting Actions and Value.
 * @param api Object with list of optional commands for the PropNode (for example, `.set()` method)
 * @param label Optional Label for debugging purposes 
 */
export function PropFactory<Inputs extends ReactiveInputsArray>(inputs: Inputs) {
  return function <Value, Actions extends DefaultActionTuple = ['SET', Value]>(
    fn: PropFn<Inputs, Value, Actions>,
    api: Record<string, any> = {},
    label?: string
  ) {
    return new PropNode(inputs, fn, api, label)
  }
}

