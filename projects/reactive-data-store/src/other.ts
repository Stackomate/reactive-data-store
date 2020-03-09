/* TODO: This wont work */
// listen<K extends ReactiveInputsArray>(deps: K, listenFn: (p: ListenFnInputs<K> & WithIterator<K>) => void): listenReturn;

/* TODO: This doesnt work, would be used together with ListenFnInputs */
// export type WithIterator<K extends AnyReactiveNode[]> = {
//     [Symbol.iterator](): Iterator<any, any, any>
// };

/* Ideas

Imagine/Dream: Create a hypothetical transaction that will be computed, but not applied.
Probably listeners won't fire either.
Dynamic reordering: Prop can "delay"/pause its execution, add new dependencies for later
Dynamic emission: Prop can choose different outputs(actions) for different dependants.
Useful for "If" structure
Shortcuts for INACTIVE values: could have side effects on next re render?
       
*/
