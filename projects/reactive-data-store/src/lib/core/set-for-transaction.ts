import { StateNode, PropNode } from './classes';
export function setForTransaction<T>(item: StateNode<T> | PropNode<T, any, any>, value: T): void {
    /* If item is a State node, mark for change */
    /* TODO: Call set method in case node is prop */
    /* TODO: Remove "this" call, use rds reference instead */

    if (item instanceof StateNode) {
        this.addChange(item, value);
    }  else if (item instanceof PropNode ) {
        if (item.api.set) {
            /* TODO: Export type for set */
            item.api.set(value, item.inputs, setForTransaction.bind(this));
        } else {
            throw new Error('Prop does not contain set method')
        }
    } else {
        throw new Error('Target node is not State or Prop')
    }

}
