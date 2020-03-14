import { RAAction } from '../types';

/**
 * Given an array of actions, apply them to an array and return a new array as result.
 * @param actions 
 * @param initialValue 
 */
export function applyActions<T>(actions: Array<RAAction<T>>, initialValue: T[]) {
  let currentValue = initialValue;
  actions.forEach((action) => {
    currentValue = modify(currentValue, action);
  });
  return currentValue;
}

/**
 * Apply an action to an array. Returns a new array with the changes.
 * @param arr 
 * @param action 
 */
function modify<T>(arr: T[], action: RAAction<T>): T[] {
  let nArr = [...arr];
  switch (action[0]) {
    case 'SET':
      return action[1];
    case 'SET_KEY':
      nArr[action[1][0]] = action[1][1];
      return nArr;
    case 'DELETE_KEY':
      delete nArr[action[1]];
      return nArr;
    case 'SET_KEY_INNER':
      /* TODO: Remove any, if possible */
      const innerActions = action[1][1] as RAAction<any>[];
      const index = action[1][0];
      /* TODO: Remove any, if possible */
      (nArr[index] as any) = applyActions(innerActions, nArr[index] as any)
      return nArr;
  }
}
