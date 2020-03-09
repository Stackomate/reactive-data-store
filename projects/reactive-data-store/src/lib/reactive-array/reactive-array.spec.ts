import { ReactiveDataStore } from "../core/reactive-data-store";
import { State } from '../core/classes';
import { MapValuesTo } from '../utils/prop-factories';
import { ReactiveArray, setIndex, push } from './reactive-array';
import { NodeSummary } from '../types';
import { applyActions } from './apply-actions';
describe('ReactiveArray', () => {
  let rds: ReactiveDataStore;
  it('should create', () => {
    let arr = ReactiveArray([1, 2, 3]);
    expect(arr).toBeDefined();
    rds = new ReactiveDataStore([arr]);
  });
  it('should accept change from dependencies', () => {
    let arr = ReactiveArray([1, 2, 3]);
    expect(arr).toBeDefined();
    rds = new ReactiveDataStore([arr]);
    expect(arr.value).toEqual([1, 2, 3]);
    let oldValue = arr.value;
    /* TODO: Improve type */
    let summary: NodeSummary<typeof arr>;
    rds.listen([arr], ([arrSummary]) => {
      summary = arrSummary;
    });
    rds.transaction(() => {
      setIndex(rds, arr, 0, 99);
    });
    let s0: NodeSummary<typeof arr> = {
      pushed: true,
      error: null,
      /* TODO: Verify below */
      dependencyChanges: [{
        previous: 1,
        value: 99,
        actions: [['SET', 99]],
        
      }, {
        previous: 2,
        value: 2,
        actions:[],
        
      }, {
        previous: 3,
        value: 3,
        actions: [],
        
      }],
      isPropNode: true,
      isStateNode: false,
      subscriptionChanges: null,
      actions: [
        ['SET_KEY', [0, 99]]
      ],
      value: [99, 2, 3],
      previousValue: [1, 2, 3]
    };
    expect(summary).toEqual(s0);
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);
    expect(arr.value).toEqual([99, 2, 3]);
    oldValue = arr.value;
    /* TODO: Improve API, remove rds from setIndex */
    rds.transaction(() => {
      setIndex(rds, arr, 1, 98);
      setIndex(rds, arr, 2, 97);
    });
    expect(summary).toEqual({
      pushed: true,
      error: null,
      dependencyChanges: [{
        previous: 99,
        value: 99,
        actions: [],
        
      }, {
        previous: 2,
        value: 98,
        actions: [['SET', 98]],
        
      }, {
        previous: 3,
        value: 97,
        actions: [['SET', 97]],
        
      }],
      isPropNode: true,
      isStateNode: false,
      subscriptionChanges: null,
      actions: [
        ['SET_KEY', [1, 98]],
        ['SET_KEY', [2, 97]]
      ],
      value: [99, 98, 97],
      previousValue: [99, 2, 3]
    });
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);
    expect(arr.value).toEqual([99, 98, 97]);
  });
  it('should allow adding a number', () => {
    let arr = ReactiveArray([1, 2, 3]);
    expect(arr).toBeDefined();
    rds = new ReactiveDataStore([arr]);
    expect(arr.value).toEqual([1, 2, 3]);
    let summary: NodeSummary<typeof arr>;
    rds.listen([arr], ([arrSummary]) => {
      summary = arrSummary;
    });
    rds.transaction(() => {
      push(rds, arr, 4);
    });
    let s2: NodeSummary<typeof arr> = {
      pushed: true,
      isPropNode: true,
      isStateNode: false,
      error: null,
      dependencyChanges: [{
        actions: [],
        previous: 1,
        value: 1,
        
      }, {
        actions: [],
        previous: 2,
        value: 2,
        
      }, {
        actions: [],
        previous: 3,
        value: 3,
        
      }, 
      /* Newly added */
      {
        actions: [['SET', 4]],
        previous: 4,
        value: 4,
        
      }],
      subscriptionChanges: {
        /* TODO: Use Getter here */ 
        added: new Map([[3, arr.inputs[3]]]),
        removed: new Map(),
        isInit: false
      },
      actions: [
        ['SET_KEY', [3, 4]]
      ],
      value: [1, 2, 3, 4],
      previousValue: [1, 2, 3]
    }
    expect(summary).toEqual(s2);
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);
    expect(arr.value).toEqual([1, 2, 3, 4]);
    /* TODO: The problem of sequential updates */
    /* TODO: Improve API, remove rds from setIndex */
    rds.transaction(() => {
      push(rds, arr, 5);
      push(rds, arr, 6);
    });
    let s0: NodeSummary<typeof arr> = {
      pushed: true,
      isPropNode: true,
      isStateNode: false,
      error: null,
      dependencyChanges: [
        {
          previous: 1,
          value: 1,
          actions: [],
          
        },
        {
          previous: 2,
          value: 2,
          actions: [],
          
        },
        {
          previous: 3,
          value: 3,
          actions: [],
          
        },
        {
          previous: 4,
          value: 4,
          actions: [],
          
        },
        /* Added */
        {
          previous: 5,
          value: 5,
          actions: [['SET', 5]],
          
        },
        {
          previous: 6,
          value: 6,
          actions: [['SET', 6]],
          
        }
      ],
      subscriptionChanges: {
        added: new Map([[4, arr.inputs[4]], [5, arr.inputs[5]]]),
        removed: new Map(),
        isInit: false
      },
      actions: [
        ['SET_KEY', [4, 5]],
        ['SET_KEY', [5, 6]]
      ],
      value: [1, 2, 3, 4, 5, 6],
      previousValue: [1, 2, 3, 4]
    }
    expect(summary).toEqual(s0);
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);
    expect(arr.value).toEqual([1, 2, 3, 4, 5, 6]);

    rds.transaction(() => {
      setIndex(rds, arr, 1, 98);
      setIndex(rds, arr, 2, 97);
    });
    let s1: NodeSummary<typeof arr> = {
      pushed: true,
      isPropNode: true,
      isStateNode: false,
      error: null,
      dependencyChanges: [{
        previous: 1,
        value: 1,
        actions: []
      }, {
        previous: 2,
        value: 98,
        actions: [['SET', 98]]
      }, {
        previous: 3,
        value: 97,
        actions: [['SET', 97]]
      }, {
        previous: 4,
        value: 4,
        actions: []
      }, {
        previous: 5,
        value: 5,
        actions: []
      }, {
        previous: 6,
        value: 6,
        actions: []
      }],
      subscriptionChanges: null,      
      actions: [
        ['SET_KEY', [1, 98]],
        ['SET_KEY', [2, 97]]
      ],
      value: [1, 98, 97, 4, 5, 6],
      previousValue: [1, 2, 3, 4, 5, 6]
    }
    expect(summary).toEqual(s1);
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);
    expect(arr.value).toEqual([1, 98, 97, 4, 5, 6]);
    rds.transaction(() => {
      setIndex(rds, arr, 5, 33);
    });
    expect(summary).toEqual({
      pushed: true,
      isPropNode: true,
      isStateNode: false,
      error: null,
      dependencyChanges: [{
        previous: 1,
        value: 1,
        actions: [],
        
      }, {
        previous: 98,
        value: 98,
        actions: [],
        
      }, {
        previous: 97,
        value: 97,
        actions: [],
        
      }, {
        previous: 4,
        value: 4,
        actions: [],
        
      }, {
        previous: 5,
        value: 5,
        actions: [],
        
      }, {
        previous: 6,
        value: 33,
        actions: [['SET', 33]],
        
      }],
      subscriptionChanges: null,      
      actions: [
        ['SET_KEY', [5, 33]],
      ],
      value: [1, 98, 97, 4, 5, 33],
      previousValue: [1, 98, 97, 4, 5, 6]
    });
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);
    expect(arr.value).toEqual([1, 98, 97, 4, 5, 33]);
  });
  it('should allow adding a state', () => {
    /* Same test as #1, but contains a state as input */
    let myState = State(2);
    let arr = ReactiveArray([1, myState, 3]);
    expect(arr).toBeDefined();
    rds = new ReactiveDataStore([arr]);
    expect(arr.value).toEqual([1, 2, 3]);
    let oldValue = arr.value;
    /* TODO: Improve type */
    let summary: NodeSummary<typeof arr>;
    rds.listen([arr], ([arrSummary]) => {
      summary = arrSummary;
    });
    rds.transaction(() => {
      setIndex(rds, arr, 0, 99);
    });
    let s0: NodeSummary<typeof arr> = {
      pushed: true,
      isPropNode: true,
      isStateNode: false,
      error: null,
      dependencyChanges: [{
        previous: 1,
        value: 99,
        actions: [['SET', 99]],
        
      }, {
        previous: 2,
        value: 2,
        actions: [],
        
      }, {
        previous: 3,
        value: 3,
        actions: [],
        
      }],
      subscriptionChanges: null,      
      actions: [
        ['SET_KEY', [0, 99]]
      ],
      value: [99, 2, 3],
      previousValue: [1, 2, 3]
    };
    expect(summary).toEqual(s0);
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);
    expect(arr.value).toEqual([99, 2, 3]);
    oldValue = arr.value;
    /* TODO: Improve API, remove rds from setIndex */
    rds.transaction(() => {
      /* Adding a new state here */
      setIndex(rds, arr, 1, 98);
      setIndex(rds, arr, 2, 97);
    });
    expect(summary).toEqual({
      pushed: true,
      isPropNode: true,
      isStateNode: false,
      error: null,
      dependencyChanges: [{
        previous: 99,
        value: 99,
        actions: [],
        
      }, {
        previous: 2,
        value: 98,
        actions: [['SET', 98]],
        
      }, {
        previous: 3,
        value: 97,
        actions: [['SET', 97]],
        
      }],
      subscriptionChanges: null,      
      actions: [
        ['SET_KEY', [1, 98]],
        ['SET_KEY', [2, 97]]
      ],
      value: [99, 98, 97],
      previousValue: [99, 2, 3]
    });
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);
    expect(arr.value).toEqual([99, 98, 97]);
    /* TODO: Test when adding new State, should not tunnel */
  });
  /* TODO: allow Adding prop */
  it('should allow adding a prop', () => {
    /* Same test as #1, but contains a prop as input */
    let myState = State(7);
    let myProp = MapValuesTo([myState], ([myState]) => myState ** 2, {
      /* TODO: Remove types and auto-infer */
      /* TODO: Remove need to send rds */
      set: (value: number, inputs: any[], setChange: any) => {
        rds.setForTransaction(inputs[0], Math.sqrt(value));
      }
    });
    let otherProp = MapValuesTo([myProp], ([myProp]) => myProp - 3);
    let arr = ReactiveArray([1, myProp, 3]);
    expect(arr).toBeDefined();
    rds = new ReactiveDataStore([arr]);
    expect(arr.value).toEqual([1, 49, 3]);
    expect(otherProp.value).toEqual(46);
    let oldValue = arr.value;
    /* TODO: Improve type */
    let summary: NodeSummary<typeof arr>;
    rds.listen([arr], ([arrSummary]) => {
      summary = arrSummary;
    });
    rds.transaction(() => {
      setIndex(rds, arr, 0, 99);
    });
    let s1: NodeSummary<typeof arr> = {
      pushed: true,
      isPropNode: true,
      isStateNode: false,
      error: null,
      dependencyChanges: [{
        previous: 1,
        value: 99,
        actions: [['SET', 99]],
        
      }, {
        previous: 49,
        value: 49,
        actions: [],
        
      }, {
        previous: 3,
        value: 3,
        actions: [],
        
      }],
      subscriptionChanges: null,      
      actions: [
        ['SET_KEY', [0, 99]]
      ],
      value: [99, 49, 3],
      previousValue: [1, 49, 3]
    }
    expect(summary).toEqual(s1);
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);
    expect(arr.value).toEqual([99, 49, 3]);
    oldValue = arr.value;
    /* TODO: Improve API, remove rds from setIndex */
    rds.transaction(() => {
      /* Adding a new state here */
      setIndex(rds, arr, 1, 98);
      setIndex(rds, arr, 2, 97);
    });
    let s2: NodeSummary<typeof arr> = {
      pushed: true,
      isPropNode: true,
      isStateNode: false,
      error: null,
      dependencyChanges: [{
        previous: 99,
        value: 99,
        actions: [],
        
      }, {
        previous: 49,
        value: 98,
        actions: [['SET', 98]],
        
      }, {
        previous: 3,
        value: 97,
        actions: [['SET', 97]],
        
      }],
      subscriptionChanges: null,      
      actions: [
        ['SET_KEY', [1, 98]],
        ['SET_KEY', [2, 97]]
      ],
      value: [99, 98, 97],
      previousValue: [99, 49, 3]
    };
    expect(summary).toEqual(s2);
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);
    expect(arr.value).toEqual([99, 98, 97]);
    expect(myState.value).toEqual(Math.sqrt(98));
    expect(otherProp.value).toEqual(95);
    /* TODO: Test when adding new Prop, should not tunnel */
  });

  it('should allow nesting arrays', () => {
    let arr = ReactiveArray([1, 2, 3]);
    expect(arr).toBeDefined();
    let secondArr = ReactiveArray<number[] | number>([arr, 4]);
    rds = new ReactiveDataStore([secondArr]);  
    let summary: NodeSummary<typeof secondArr>; 
    rds.listen([secondArr], ([secondSummary]) => {
      summary = secondSummary;
    })
    expect(secondArr.value).toEqual([[1, 2, 3], 4]);
    expect(arr.value).toEqual([1, 2, 3])
    /* TODO: SetIndex should work for nested */
    rds.transaction(() => {
      /* Adding a new state here */
      setIndex(rds, arr, 1, 98);
      setIndex(rds, arr, 2, 97);
    });    
    expect(arr.value).toEqual([1, 98, 97])
    /* TODO: Remove as any*/
    expect(secondArr.value).toEqual([[1, 98, 97], 4])
    let sum0: NodeSummary<typeof secondArr> = {
      pushed: true,
      actions: [
        ['SET_KEY_INNER', [0, ['SET_KEY', [1, 98]]]],
        ['SET_KEY_INNER', [0, ['SET_KEY', [2, 97]]]]
      ],
      value: [[1, 98, 97], 4],
      previousValue: [[1, 2, 3], 4],
      error: null,
      isPropNode: true,
      isStateNode: false,
      dependencyChanges: [
        {
          previous: [1, 2, 3],
          value: [1, 98, 97],
          actions: [
            ['SET_KEY', [1, 98]],
            ['SET_KEY', [2, 97]]
          ]
        },
        {
          previous: 4,
          value: 4,
          actions: []
        }
      ],
      subscriptionChanges: null
    };
    expect(summary).toEqual(sum0);
    expect(applyActions(summary.actions, summary.previousValue)).toEqual(summary.value);

  })
});
describe('CompareFunction', () => {
  it('should apply set action', () => {
    let arr = [1, 2, 3, 4];
    let result;
    expect(() => result = applyActions([
      ['SET', [9, 8]]
    ], arr)).not.toThrow();
    expect(result).toEqual([9, 8]);
    expect(() => result = applyActions([
      ['SET', [1, 2]]
    ], arr)).not.toThrow();
    expect(result).toEqual([1, 2]);
  });
  it('should apply set action', () => {
    let arr = [1, 2, 3, 4];
    let result;
    expect(() => result = applyActions([
      ['SET_KEY', [4, 5]]
    ], arr)).not.toThrow();
    expect(result).toEqual([1, 2, 3, 4, 5]);
    expect(() => result = applyActions([
      ['SET_KEY', [0, 99]]
    ], arr)).not.toThrow();
    expect(result).toEqual([99, 2, 3, 4]);
    expect(() => result = applyActions([
      ['SET_KEY', [0, 98]],
      ['SET_KEY', [1, 97]]
    ], arr)).not.toThrow();
    expect(result).toEqual([98, 97, 3, 4]);
    expect(() => result = applyActions([
      ['SET', [5, 15, 25]],
      ['SET_KEY', [4, 55]]
    ], arr)).not.toThrow();
    expect(result).toEqual([5, 15, 25, undefined, 55]);
  });
});