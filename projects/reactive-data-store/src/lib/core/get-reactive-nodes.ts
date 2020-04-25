import { ReactiveDataStore } from './reactive-data-store';
import { AnyReactiveNode } from '../types-base';
import { StateNode, PropNode } from './classes';

const traverse = (
    rds: ReactiveDataStore, 
    existentNodes: Set<AnyReactiveNode>, 
    analyzingNodes: Set<AnyReactiveNode>, 
    analyzedNodes: Set<AnyReactiveNode>, 
    expansion: Set<AnyReactiveNode>
) : void => {
    /* Loop through provided entry nodes and find all nodes missing from rds. */
    expansion.forEach(node => {

        /* Stop if already added to the store. */
        if (existentNodes.has(node)) {
            return;
        }

        /* Else if not contained in store, check whether it's being analyzed already */
        if (analyzingNodes.has(node)) {
            /* Return if positive, since another procedure is already working on traversing the node */
            return;
        }

        /* Else If already analyzed then we can skip as well */
        if (analyzedNodes.has(node)) {
            return;
        }

        /* Otherwise, it's the first time traversing the node. */
        /* Mark it as "analyzing" */
        analyzingNodes.add(node);

        /* Grab all of its inputs + outputs */
        let adjacents: AnyReactiveNode[] = [];
        if (node instanceof StateNode) {
            adjacents = [...node.outputs];
        } else if (node instanceof PropNode) { /* Must be PropNode */
            adjacents = [...node.outputs, ...node.inputs];
        } else {    
            throw new Error('Unrecognized Node Type')
        }

        /* recursively traverse all adjacent nodes */
        traverse(rds, existentNodes, analyzingNodes, analyzedNodes, new Set(adjacents));

        analyzingNodes.delete(node);
        analyzedNodes.add(node);

    })
}

export const getDisconnectedNodes = (rds: ReactiveDataStore, nodes: AnyReactiveNode[]) : Set<AnyReactiveNode> => {
    /* Keep track of three groups of ReactiveNodes */
    const existentNodes = rds.allNodes;
    const analyzingNodes = new Set<AnyReactiveNode>();
    const analyzedNodes = new Set<AnyReactiveNode>();

    traverse(rds, existentNodes, analyzingNodes, analyzedNodes, new Set(nodes));

    /* When an existent node is found stop because it's assumed existent nodes have all connection nodes
    already added to the store. That means only entry nodes will be deeply traversed */

    return analyzedNodes;
}