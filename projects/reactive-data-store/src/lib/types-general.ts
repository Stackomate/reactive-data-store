/* General Extractors and Utils */
// https://stackoverflow.com/questions/56006111/is-it-possible-to-define-a-non-empty-array-type-in-typescript/56006703
/**
 * Force an array to have at least one item
 */
export type NonEmptyArray<T> = [T, ...T[]];
/**
 * Get only the index numbers from an array
 */
export type ArrayIndexes<I> = Exclude<keyof I & string, keyof Array<any>>;
