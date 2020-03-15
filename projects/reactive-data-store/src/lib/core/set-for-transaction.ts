import { StateNode } from './classes';
export function setForTransaction<T>(item: StateNode<T>, value: T): void {
    /* If item is a State node, mark for change */
    /* TODO: Call set method in case node is prop */
    /* TODO: Remove "this" call, use rds reference instead */
    this.addChange(item, value);
}
