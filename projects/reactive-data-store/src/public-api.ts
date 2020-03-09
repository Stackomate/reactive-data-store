/*
 * Public API Surface of reactive-data-store
 */

export {PropNode, StateNode, State, Prop, PropFactory} from './lib/core/classes'
export { ReactiveDataStore} from './lib/core/reactive-data-store';
/* TODO: Return factory function for itemsMap */ 
export {idGenFn, toLabel, idToObject, itemsMap} from './lib/core/ids'
export {getAllNodes} from './lib/core/utils';
export {ReactiveNode} from './lib/types';
export {MapValuesTo, MapValuesToImmutable} from './lib/utils/prop-factories';
export {propUtils, pushIfChanged} from './lib/utils/prop-utils';


/* TODO: MapToProp with dynamic arguments */
/* TODO: Explain Types (node - ReactiveNode, InputSummary) */
