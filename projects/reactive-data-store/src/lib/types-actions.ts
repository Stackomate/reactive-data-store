/** SET_KEY action type for Reactive Arrays */
export type SET_KEY_ACTION<V> = ['SET_KEY', [number, V]];
export type DELETE_KEY_ACTION<V> = ['DELETE_KEY', number];
/**
 * Allowed Actions for ReactiveArrays
 */
export type SET_KEY_INNER_ACTION<V> = ['SET_KEY_INNER', [number, RAAction<V>[]]];
export type RAAction<T> = (T extends Array<infer M> ? SET_KEY_INNER_ACTION<M> : never) | SET_KEY_ACTION<T> | ['SET', T[]] | DELETE_KEY_ACTION<T>;
// type SET_MAP_KEY<K> = ['SET_MAP_KEY', [K, K]];
// type SET_MAP_VALUE<K, V> = ['SET_MAP_VALUE', [K, V]];
type DELETE_MAP_PAIR<K> = ['DELETE_MAP_PAIR', K];
type SET_MAP_PAIR<K, V> = ['SET_MAP_PAIR', [MAP_KEY_ACTION<K>, MAP_VALUE_ACTION<V>]];
type MAP_KEY_ACTION<K> = ['SET', K, K] | ['SET_INNER', K, K] | ['KEEP', K];
type MAP_VALUE_ACTION<V> = ['SET', V] | ['SET_INNER', V] | ['KEEP'];
export type RMapAction<K, V> = ['SET', Map<K, V>] | /*SET_MAP_KEY<K> | SET_MAP_VALUE<K, V> |*/ DELETE_MAP_PAIR<K> | SET_MAP_PAIR<K, V>;
export type DefaultActionTuple = [string, any];
