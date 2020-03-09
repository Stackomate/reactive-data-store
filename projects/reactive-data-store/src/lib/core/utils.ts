import {PropNode, StateNode } from './classes'
import { NodeSetType, AnyReactiveNode} from '../types'


/**
 * Returns all nodes when given array of Leaves
 */
export function getAllNodes(items: AnyReactiveNode[]): Set<AnyReactiveNode> {


  const nodeSet: NodeSetType = new Set();
  const visited: Array<AnyReactiveNode> = [];
  let currentIndex = 0;

  const analyze = (n: AnyReactiveNode) => {
    let connections = [...Array.from(n.outputs), ...(n instanceof PropNode ? n.inputs.filter(
      /* We need to filter empty slots */
      (i: AnyReactiveNode) => i !== undefined
    ) : [])];


    for (let next of connections) {
      if(nodeSet.has(next) === false) {
        nodeSet.add(next);
        visited.push(next);
      }
    } 

    currentIndex++;
  }


  items.forEach(node => {

    if(nodeSet.has(node) === false) {
      visited.push(node);
      nodeSet.add(node);
    }

    while (currentIndex < visited.length) {
      analyze(visited[currentIndex]);
    }

  })

  return nodeSet;
}

/**
 * Return all edges [from, to] pairs when given array of nodes
 */
export const getAllEdges = (nodes: AnyReactiveNode[]) => {
  let edges: Array<[AnyReactiveNode, PropNode<any, any, any>]> = [];
  nodes.forEach(n => {
    let outputs = Array.from(n.outputs)
    outputs.forEach(o => edges.push([n, o]))
  })

  return edges;
}

/* TODO: Typing */
export function toposort (nodes: Set<AnyReactiveNode>): Array<Set<AnyReactiveNode>> {
  let levels = new Map(Array.from(nodes).map(n => [n, 0]));
  let count = 0;

  /* First, filter only State */
  let onlyStateObjects: StateNode<any>[] = Array.from(nodes).filter(n => n instanceof StateNode) as StateNode<any>[];

  function step<T extends AnyReactiveNode> (items: T[]) {
    let nextItems: Set<PropNode<any, any, any>> = new Set();
    items.forEach((s) => {
      Array.from(s.outputs).forEach(o => {
        levels.set(o, count + 1);
        nextItems.add(o);
      })
    })
    count++;
    if (nextItems.size > 0 ) {
      step(Array.from(nextItems))
    } 
  }

  step(onlyStateObjects)

  const result: Array<Set<AnyReactiveNode>> = [];
  Array.from(levels.entries()).forEach(([item, level]) => {
    result[level] = result[level] || new Set<AnyReactiveNode>();
    result[level].add(item)
  }) 
  return result;

}
