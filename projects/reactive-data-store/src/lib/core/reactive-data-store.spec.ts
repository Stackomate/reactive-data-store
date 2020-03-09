import { ReactiveDataStore } from "./reactive-data-store";
import { State } from './classes';
import { MapValuesTo, MapValuesToImmutable } from '../utils/prop-factories';
import { globalSummary, NodeSummary, SummaryMap } from '../types';

describe('ReactiveDataStore', () => {
  let rds: ReactiveDataStore;

  beforeEach(() => {

  });

  it('should load empty entry', () => {
    rds = new ReactiveDataStore([])
    expect(rds).toBeDefined()
  });

  it('should load one state entry', () => {
    const s = State(1);
    expect(s.value).toEqual(1);
    rds = new ReactiveDataStore([s]);
    expect(s.value).toEqual(1);
    expect(rds.isRevising).toBe(false)
  })

  it('should load one state and one mapValuesTo property', () => {
    let state = State(3);
    let prop = MapValuesTo([state], ([i]) => i * 2)
    rds = new ReactiveDataStore([prop])
    expect(state.value).toEqual(3);
    expect(prop.value).toEqual(6)

    /* Add global listener */
    let summary: globalSummary;
    rds.listen((summaryResult) => {
      summary = summaryResult;
    })

    expect(summary).not.toBeDefined();


    rds.transaction((set) => {
      set(state, 5);
    })
    expect(state.value).toEqual(5)
    expect(prop.value).toEqual(10)

    expect(summary).toBeDefined();

    const summaries: SummaryMap = new Map()
    /* TODO: Use ctor instead */
    summaries.set(
      state, {
        actions: [['SET', 5]],
        value: 5,
        previousValue: 3,
        pushed: true,
        /* TODO: Fix, should not show up for state */
        dependencyChanges: [],
        /* TODO: include changes here */
        subscriptionChanges: null,
        error: null,
        isStateNode: true,
        isPropNode: false
      });
    
    summaries.set(
        prop, {
          actions: [['SET', 10]],
          value: 10,
          previousValue: 6,
          pushed: true,
          dependencyChanges: [{
            /* TODO: Fix this */
            actions: [['SET', 5]] as any,
            previous: 3,
            value: 5
          }],
          /* TODO: Include changes here */
          subscriptionChanges: null, 
          error:null,
          isPropNode: true,
          isStateNode: false
        }      
    )

    expect(summary).toEqual({
      summaries,
      checkedNodes: new Set([state, prop]),
      changedNodes: new Set([state, prop]),
      addedNodes: new Set(),
      removedNodes: new Set(),
      erroredNodes: new Set(),
      allNodes: new Set([state, prop]),
      status: 'SUCCESS',
      resolutionOrder: [new Set([state]), new Set([prop])]
    })

  })

  it('should load one state and two eager properties', () => {
    let state = State(3);
    let prop = MapValuesTo([state], ([s]) => s * 2)
    let prop2 = MapValuesTo([state], ([s]) => s + 4)
    rds = new ReactiveDataStore([prop])

    /* Add global listener */
    let summary: globalSummary;
    rds.listen((summaryResult) => {
      summary = summaryResult;
    })

    expect(prop.value).toEqual(6)
    expect(prop2.value).toEqual(7)
    rds.transaction((set) => {
      set(state, 5);
    })
    expect(state.value).toEqual(5)
    expect(prop.value).toEqual(10)
    expect(prop2.value).toEqual(9)

    const summaries: SummaryMap = new Map();

    summaries.set(state, {
      pushed: true,
      actions: [['SET', 5]],
      previousValue: 3,
      value: 5,
      error: null,
      dependencyChanges: [],
      subscriptionChanges: null,
      isStateNode: true,
      isPropNode: false
    })

    summaries.set(prop, {
      pushed: true, 
      actions: [['SET', 10]],
      value: 10,
      previousValue: 6,
      error: null,
      dependencyChanges: [
        {
          /* TODO: Fix */
          actions: [['SET', 5]] as any,
          previous: 3,
          value: 5
        }
      ],
      subscriptionChanges: null,
      isPropNode: true,
      isStateNode: false
    })

    summaries.set(prop2, {
      pushed: true,
      /* TODO: Fix */
      actions: [['SET', 9]] as any,
      value: 9,
      previousValue: 7,
      error: null,
      dependencyChanges: [
        {
          actions: [['SET', 5]] as any,
          previous: 3,
          value: 5,
        }
      ],
      subscriptionChanges: null,
      isPropNode: true,
      isStateNode: false
    })

    expect(summary).toEqual({
      summaries,
      checkedNodes: new Set([state, prop, prop2]),
      changedNodes: new Set([state, prop, prop2]),
      addedNodes: new Set(),
      removedNodes: new Set(),
      erroredNodes: new Set(),
      allNodes: new Set([state, prop, prop2]),
      status: 'SUCCESS',
      resolutionOrder: [new Set([state]), new Set([prop, prop2])]
    })

  })

  it('should load one state and three eager properties', () => {
    /* TODO: Check levels (toposort) */
    let state = State(3);
    let prop = MapValuesTo([state], ([s]) => s * 2)
    let prop2 = MapValuesTo([state], ([s]) => s + 4)
    let prop3 = MapValuesTo([prop, prop2], ([p2, p3]) => p2 * p3)
    rds = new ReactiveDataStore([prop])

    /* Add global listener */
    let summary: globalSummary;
    rds.listen((summaryResult) => {
      summary = summaryResult;
    })

    expect(prop.value).toEqual(6)
    expect(prop2.value).toEqual(7)
    expect(prop3.value).toEqual(42)
    
    rds.transaction((set) => {
      set(state, 5);
    })

    const summaries: SummaryMap = new Map();
    summaries.set(state, {
      pushed: true,
      actions: [['SET', 5]] as any,
      error: null,
      subscriptionChanges: null,
      dependencyChanges: [],
      previousValue: 3,
      value: 5,
      isStateNode: true,
      isPropNode: false
    })

    summaries.set(prop, {
      pushed: true,
      actions: [['SET', 10]] as any,
      error: null,
      subscriptionChanges: null,
      dependencyChanges: [{
        actions: [['SET', 5]] as any,
        previous: 3,
        value: 5
      }],
      previousValue: 6,
      value: 10,
      isStateNode: false,
      isPropNode: true
    })    

    summaries.set(prop2, {
      pushed: true,
      actions: [['SET', 9]] as any,
      error: null,
      subscriptionChanges: null,
      dependencyChanges: [{
        actions: [['SET', 5]] as any,
        previous: 3,
        value: 5,
        
      }],
      previousValue: 7,
      value: 9,
      isStateNode: false,
      isPropNode: true
    })    

    summaries.set(prop3, {
      pushed: true,
      actions: [['SET', 90]] as any,
      error: null,
      subscriptionChanges: null,
      dependencyChanges: [{
        actions: [['SET', 10]] as any,
        previous: 6,
        value: 10,
        
      }, {
        actions: [['SET', 9]] as any,
        previous: 7,
        value: 9,
        
      }],
      previousValue: 42,
      value: 90,
      isStateNode: false,
      isPropNode: true
    })    

    expect(summary.summaries.get(state)).toEqual(summaries.get(state))
    expect(summary.summaries.get(prop)).toEqual(summaries.get(prop));
    expect(summary.summaries.get(prop2)).toEqual(summaries.get(prop2));
    expect(summary.summaries.get(prop3)).toEqual(summaries.get(prop3));

    expect(summary).toEqual({
      summaries,
      checkedNodes: new Set([state, prop, prop2, prop3]),
      changedNodes: new Set([state, prop, prop2, prop3]),
      addedNodes: new Set(),
      removedNodes: new Set(),
      erroredNodes: new Set(),
      allNodes: new Set([state, prop, prop2, prop3]),
      status: 'SUCCESS',
      resolutionOrder: [new Set([state]), new Set([prop, prop2]), new Set([prop3])]
    })

    expect(state.value).toEqual(5)
    expect(prop.value).toEqual(10)
    expect(prop2.value).toEqual(9)
    expect(prop3.value).toEqual(90)
  })

  it('should load state and immutable prop', () => {
    const state = State(3);
    const prop = MapValuesToImmutable([state], ([state]) => {
      return state % 2;
    })
    /* TODO: Entry does not work with prop */
    const rds = new ReactiveDataStore([prop]);
    expect(prop.value).toEqual(1);
    let summaryList: [NodeSummary<typeof state>, NodeSummary<typeof prop>];
    rds.listen([state, prop], (summaries) => {
      summaryList = summaries;
    })

    rds.transaction((set) => {
      set(state, 4);
    })

    expect(state.value).toEqual(4);
    expect(prop.value).toEqual(0);
    let s0: NodeSummary<typeof state> = {
      pushed: true,
      error: null,
      isStateNode: true,
      isPropNode: false,
      dependencyChanges: [],
      subscriptionChanges: null,
      actions: [['SET', 4]],
      previousValue: 3,
      value: 4
    };
    let p0: NodeSummary<typeof prop> = {
      pushed: true,
      error: null,
      isStateNode: false,
      isPropNode: true,
      dependencyChanges: [{
        actions: [['SET', 4]] as any,
        previous: 3,
        value: 4,
        
      }],
      subscriptionChanges: null,
      actions: [['SET', 0]],
      previousValue: 1,
      value: 0
    }
    expect(summaryList[0]).toEqual(s0)
    expect(summaryList[1]).toEqual(p0)

    /* Since prop is Immutable, we expect it not to push any changes for next transaction */
    rds.transaction((set) => {
      set(state, 6);
    })
    expect(state.value).toEqual(6);
    expect(prop.value).toEqual(0);    
    let s1: NodeSummary<typeof state> = {
      pushed: true,
      error: null,
      isStateNode: true,
      isPropNode: false,
      dependencyChanges: [],
      subscriptionChanges: null,
      actions: [['SET', 6]],
      previousValue: 4,
      value: 6
    };
    let p1: NodeSummary<typeof prop> = {
      pushed: false,
      error: null,
      isStateNode: false,
      isPropNode: true,
      dependencyChanges: [{
        actions: [['SET', 6]] as any,
        previous: 4,
        value: 6,
        
      }],
      subscriptionChanges: null,
      actions: [],
      previousValue: 0,
      value: 0
    }
    expect(summaryList[0]).toEqual(s1)
    expect(summaryList[1]).toEqual(p1)    
  });

  it('should delete input', () => {
    let state = State(11);
    let state2 = State(19);
    let prop = MapValuesToImmutable([state, state2], (inputs) => {
      const reducer = (accumulator: number, currentValue: number) => accumulator + currentValue;
      return inputs.reduce(reducer, 0)
    })
    let rds = new ReactiveDataStore([prop]);
    expect(prop.value).toEqual(30)
    let summaryList: [NodeSummary<typeof state>, NodeSummary<typeof state2>, NodeSummary<typeof prop>];
    rds.listen([state, state2, prop], (summaries) => {
      summaryList = summaries;
    })

    rds.transaction((set) => {
      set(state, 13)
    })
    expect(prop.value).toEqual(32);

    /* Now we remove the first state (13) */
    /* TODO: Check all summaries */
    rds.transaction((set) => {
      rds.removeDependencies(prop, ['0'])
    })
    let p0: NodeSummary<typeof prop> = {
      pushed: true,
      isPropNode: true,
      isStateNode: false,
      actions: [['SET', 19]],
      value: 19,
      previousValue: 32,
      error: null,
      subscriptionChanges: {
        added: new Map(),
        /* TODO: Remove as any, use number as key */
        removed: new Map([['0', state]]) as any,
        isInit: false
      },
      dependencyChanges: [
        undefined,
        {
          /* TODO: remove as any */
          actions: [] as any,
          previous: 19,
          value: 19
        }
      ]
    };
    expect(summaryList[2]).toEqual(p0)

    /* TODO: Test summary */
    rds.transaction((set) => {
      rds.removeDependencies(prop, ['1'])
    })
    expect(prop.value).toEqual(0)

    rds.transaction((set) => {
      rds.setDependency(prop, 0, state2);
    })

    expect(prop.value).toEqual(19);

    rds.transaction((set) => {
      rds.setDependency(prop, 1, state2);
    })

    expect(prop.value).toEqual(38);


  })

  it('should let create inputs with undefined', () => {
    let state = State(5);
    let prop = MapValuesTo([undefined, state], ([u, s]) => {
      return s + 2;
    });
    let rds = new ReactiveDataStore([prop]);
    expect(prop.value).toEqual(7);
  })

});

