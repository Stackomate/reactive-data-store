import { AnyReactiveNode } from "../types-base";
/* TODO: Move code to Reactive Data Store */
/* ID GENERATION FUNCTIONS */
/* TODO: Use weakmap for performance if possible */
export const record = new Map<AnyReactiveNode, number>();
export const inverseRecord = new Map<number, AnyReactiveNode >();

let lastRecordIndex = -1;

/**
 * Responsible for identifying Node References. Returns a number.
 * @param node If previously recorded in idGenerator, will return existing number;
 * Otherwise, will create a new number and return it.
 */
 /* TODO: Maybe use weakmaps */
export function idGenFn (node: AnyReactiveNode) : number {
  if (record.has(node)) {
    return record.get(node);
  }
  lastRecordIndex++;
  record.set(node, lastRecordIndex);
  inverseRecord.set(lastRecordIndex, node);
  return lastRecordIndex;
}

/**
 * Convert a node string id into its label
 * @param id A String Id for the desired node.
 */
export const toLabel = (id: string) : string => {
  return (inverseRecord.get(Number(id)) || {label: undefined}).label;
}

/**
 * Given a node string id, return node
 * @param id 
 */
export const idToObject = (id: string) : AnyReactiveNode => {
  return (inverseRecord.get(Number(id)) || null);
}

export const itemsMap = () => {
  return record;
}