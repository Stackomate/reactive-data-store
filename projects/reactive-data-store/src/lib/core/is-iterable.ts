/**
 * Check whether an object is iterable.
 * Examples of Iterable objects include: arrays, sets, maps or custom objects with Symbol.iterator defined
 * @param obj 
 */
export function isIterable(obj: any): boolean {
  /* checks for null and undefined (using double equals) */
  /* null == null // true */
  /* undefined == null // true */
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}
