import { StateNode, PropNode } from './core/classes';
import { DefaultActionTuple } from './types-actions';
/* Base types */
/** A Reactive Node is either a Prop or State */
export type ReactiveNode<Value, Actions extends DefaultActionTuple, Inputs extends ReactiveInputsArray> = PropNode<Value, Inputs, Actions> | StateNode<Value>;
export type AnyReactiveNode = ReactiveNode<any, any, any>;
/**
 * This is used to trick IntelliSense into getting the specific types of each input.
 * Just using a ReactiveNode[] will not work for that purpose.
 */
export type ReactiveInputsArray = [AnyReactiveNode | undefined] | (AnyReactiveNode | undefined)[];
/** Similar to ReactiveNode, but make sure it contains a certain value type */
export type ReactiveNodeOfValue<T> = StateNode<T> | PropNode<T, any, any>;
