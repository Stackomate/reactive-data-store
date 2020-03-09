import { PropNode, StateNode } from "reactive-data-store";
import * as vis from "vis-network";
import {getAllNodes, node} from 'reactive-data-store';
import { ReactiveDataStore } from "reactive-data-store";

export type VisNode = {
  id: number;
  label: string;
  color?: string;
  shape: "ellipse" | "box";
};
export type VisEdge = { from: number; to: number; id: string; dashes?: boolean };
type IdGenFn = (a: StateNode<any, any> | PropNode<any, any, any>) => number;

function StepFactory(nodes: vis.DataSet<VisNode>, edges: vis.DataSet<VisEdge>, idGeneratorFn: IdGenFn) {

  const inner = function(items: Set<node>) {
    return items.forEach(prop => {

      nodes.update({
        id: idGeneratorFn(prop),
        label: `${prop.label}`,
        shape: prop instanceof PropNode ? "ellipse" : "box"
      });

      if (prop instanceof PropNode) {
        prop.inputs.forEach((input: node) => {
          edges.update({
            from: idGeneratorFn(input),
            to: idGeneratorFn(prop),
            id: `${idGeneratorFn(input)}.${idGeneratorFn(prop)}`
          });
          inner(new Set(prop.inputs));
        });
      }

    });
  };

  return inner;
}

/**
 * Construct collections of VisJs Nodes and Edges.
 */
export const buildVisCollections = (items: node[], idGeneratorFn: IdGenFn) => {
  /* TODO: Import type for shape directly from visjs node options */
  const nodes = new vis.DataSet<VisNode>([]);
  const edges = new vis.DataSet<VisEdge>();

  StepFactory(nodes, edges, idGeneratorFn)(getAllNodes(items));

  return { nodes, edges };
};

export const visGraphOptions = {
    edges: {
      arrows: {
        to: true
      },
      color: {
        inherit: false
      }
    },
    layout: {
      randomSeed: 12,
      hierarchical: {
        direction: 'UD',
        sortMethod: 'directed'
      }
    }
  }

export class VisualInspector {
  constructor(
    public visNodes: vis.data.DataSet<VisNode, "id">,
    public visEdges: vis.data.DataSet<VisEdge, "id">
  ) {}
}  

export function visualInspector(reactiveState:ReactiveDataStore, target: HTMLElement) {
    /* VIS-Related Code */
  const container = target;
  const data = buildVisCollections(reactiveState.entry, reactiveState.idGenFn);
  const vI = new VisualInspector(
    data.nodes,
    data.edges
  );

  /* Add listeners to reactiveState */
  reactiveState.addListener('onAddChange', (n) => {
      vI.visNodes.update({
        id: n, 
        color: 'yellow'
      })
  })

  reactiveState.addListener('onCancelChange', (nodeId) => {
    vI.visNodes.update({
      id: nodeId, 
      color: null
    })   
  });

  reactiveState.addListener('markPropDirty', (propId) => {
    /* mark properties as dirty */
    vI.visNodes.update({
      id: propId, 
      color: 'yellow'
    })
  })

  reactiveState.addListener('markStateAsCurrent', (propId) => {
    vI.visNodes.update({
      id: propId, 
      color: 'red'
    })
  })

  reactiveState.addListener('evaluatedProperty', (propId, changed) => {
    vI.visNodes.update({
      id: propId,
      color: changed ? 'red' : 'green'
    })
  })  

  reactiveState.addListener('onReset', () => {
    vI.visNodes.forEach(node => {
      vI.visNodes.update({
        id: node.id,
        color: null
      })
    })
  })

  const options:vis.Options = visGraphOptions;
  const network = new vis.Network(container, data, options); 
  return vI
}