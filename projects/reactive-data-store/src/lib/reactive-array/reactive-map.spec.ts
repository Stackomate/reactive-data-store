import { ReactiveDataStore } from "../core/reactive-data-store";
import { ReactiveMap } from './ReactiveMap';
import { State } from '../core/classes';
import { MapValuesToImmutable } from '../../public-api';
import { NodeSummary } from '../types';

describe('ReactiveMap', () => {
  let rds: ReactiveDataStore;
  it('should create', () => {
    let map = ReactiveMap([[1, 2], [3, 4]]);
    expect(map).toBeDefined();
    rds = new ReactiveDataStore([map]);      
    expect(map.value).toEqual(new Map([[1, 2], [3, 4]]))
  })

  it('should accept state and prop', () => {
    let s = State(1);
    let p = MapValuesToImmutable([s], ([s]) => s + 1);
    let map = ReactiveMap([[s, p], [3, 4]]);
    expect(map).toBeDefined();
    rds = new ReactiveDataStore([map]);      
    expect(map.value).toEqual(new Map([[1, 2], [3, 4]]))

    /* Now make a transaction */
    /* TODO: Test summary */
    let summary: NodeSummary<typeof map>;
    rds.listen([map], ([mapSummary]) => {
        summary = mapSummary
    });

    rds.transaction((set) => {
        set(s, 13);
    })
    expect(map.value).toEqual(new Map([[13, 14], [3, 4]]))
    
    rds.transaction((set) => {
        set(s, 98);
    })
    expect(map.value).toEqual(new Map([[98, 99], [3, 4]]))
    

  })  
});
