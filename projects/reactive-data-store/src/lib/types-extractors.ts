import { StateNode, PropNode } from './core/classes';
import { ReactiveInputsArray } from './types-base';
/* Reactive Node Extractors, can extract Action, Inputs and Value types */
/**
 * Get array of Possible Actions for a given Reactive Node
 */
export type ActionsOf<RNode> = RNode extends StateNode<infer Value> ? ['SET', Value] : (RNode extends PropNode<any, any, infer B> ? B : never);
/**
 * Get type of value for a given Reactive Node
 */
export type ValueOf<RNode> = RNode extends StateNode<infer V> ? V : (RNode extends PropNode<infer V, any, any> ? V : never);
/**
 * Given a PropNode, return the type of its inputs.
 */
export type InputTypeOfNode<RNode> = RNode extends PropNode<any, infer I, any> ? I : never;
/**
 * Given an array of Reactive Inputs, map to an array of their values
 */
export type ValuesOfInputs<Inputs extends ReactiveInputsArray> = {
    [P in keyof Inputs]: ValueOf<Inputs[P]>;
};
