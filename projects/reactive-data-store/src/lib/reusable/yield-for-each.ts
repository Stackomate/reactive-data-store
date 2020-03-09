/* TODO: Typing, return Generator instead of any
  For some reason, Angular does not accept Generator
  neither in fn's return or yieldForEach's return
*/
export function yieldForEach<A, B>(item: Map<A, B>, fn: (a: [A, B]) => any): any;
export function yieldForEach<A>(item: Set<A>, fn: (a: A) => any): any;
export function yieldForEach<A>(item: Array<A>, fn: (a: A) => any): any;
export function* yieldForEach(item: any, fn: (a: any) => any): any {
  let entries;
  if (item instanceof Map) {
    entries = Array.from(item.entries());
  }
  else if (item instanceof Set) {
    entries = Array.from(item);
  }
  else if (Array.isArray(item)) {
    entries = item;
  }
  else {
    throw "Item is not iterable";
  }
  for (let i of entries) {
    yield* fn(i);
  }
}
