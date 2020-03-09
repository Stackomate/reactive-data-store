import { StateNode } from './classes';
import { idGenFn } from './ids';
export function setForTransaction<T>(item: StateNode<T>, value: T): void {
    /* If item is a State node, mark for change */
    let n2 = Number(idGenFn(item));
    this.addChange(n2, value);
}
