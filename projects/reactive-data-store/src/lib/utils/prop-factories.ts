import { PropNode, Prop } from '../core/classes';
import { MapFnType, ReactiveInputsArray } from '../types';



export const MapValuesTo = function <T, M extends ReactiveInputsArray>(
        inputs: M, fn: MapFnType<T, M> ,
        /* TODO: Add types */
        options = {}
    ) : PropNode<T, M, ['SET', T]> {
    return Prop(inputs, (inputSummary) => {
        /* TODO: Remove any(s) types. Not sure why it's complaining,
        but luckily the intellisense did not break for prop types.
        Very low priority, only change in case intellisense keeps working as is */
        /* Important: We are filtering empty values (vacant indexes) */
        /* TODO: Add option "not to ignore" empty values */        
        let currValues = (inputSummary as any).map((ia: any) => ia.value);

        let result = fn(currValues);
        return {
            actions: [['SET', result]],
            value: result
        }
    }, options)
}

export const MapValuesToImmutable = function <T, M extends ReactiveInputsArray>(
    inputs: M, fn: MapFnType<T, M> ,
    /* TODO: Add types */
    options = {}
) : PropNode<T, M, ['SET', T]> {
return Prop(inputs, (inputSummary, previousValue: T) => {
    /* TODO: Remove any(s) types. Not sure why it's complaining,
    but luckily the intellisense did not break for prop types.
    Very low priority, only change in case intellisense keeps working as is */
    /* Important: We are filtering empty values (vacant indexes) */
    /* TODO: Add option "not to ignore" empty values */
    let currValues = (inputSummary as any).map((ia: any) => ia.value);

    let result = fn(currValues);
    return previousValue === result ? null : {
        actions: [['SET', result]],
        value: result
    }
}, options)
}