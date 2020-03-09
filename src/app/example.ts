



  let MyMap = (entries: [any, any][], label: string) => {
    let r: [any, any][] = []
    entries.forEach((entry, index) => {
      r[index] = [undefined, undefined];
      if(entry[0] instanceof State || entry[0] instanceof Prop) {
        r[index][0] = entry[0]
      } else {
        r[index][0] = State(entry[0], entry[0]);
      }

      if(entry[1] instanceof State || entry[1] instanceof Prop) {
        r[index][1] = entry[1]
      } else {
        r[index][1] = State(entry[1], entry[1]);
      }      
    })

    let result = new Map(r);

    return Prop([].concat.apply([], r), (s, b) => {
      return {
        actions: [
          ['SET', result]
        ],
        value: result
      }
    }, {}, label)
  }


  // /* TODO: Typing */
  // let filteredMap = (
  //   map: StateNode<Map<StateNode<any>, StateNode<any>>> | PropNode<Map<StateNode<any>, StateNode<any>>, any, any>, 
  //   condition: (v: any) => boolean
  // ) => {
  //   return new Prop([map], (subscription, [m]) => {

  //     /* TODO: Build lookup utility functions */
  //     // if (m.actions[0][0] === 'SET') {
  //       let sourceMap = new Map(m.value);
  //       sourceMap.forEach((v, k) => {
  //         debugger;
  //         if(!condition(v.value)) {
  //           sourceMap.delete(k)
  //         };
  //       })
  //       return {
  //         actions: ['SET'],
  //         value: sourceMap
  //       }
  //     // }

  //     // return {
  //     //   actions: ['SET'],
  //     //   value: m.value.filter(i => {

  //     //   })
  //     // }
  //   }, {}, 'filteredMap')
  // }

  // let obj = MyMap([
  //   ['a', true],
  //   ['b', false]
  // ], 'myMap')

  export const entry = [formula, bSquared, z]