  // let ifGEqThanZero = new Prop([delta], (s, [delta]) => {
  //   let r = delta.value >= 0;
  //   return {
  //     actions: [
  //       ['SET', r]
  //     ],
  //     value: r
  //   }
  // }, 'if >= 0')

  // let IfFirstEqualsEmit = (value) => (dependencies) => new Prop(dependencies, (s, [ifGEqThanZero, delta]) => {

  //   if (ifGEqThanZero.value !== value) {
  //     return {
  //       actions: []
  //     }
  //   }

  //   return {
  //     actions: [
  //       ['SET', delta.value],
  //     ],
  //     value: delta.value
  //   }
  // }, `ifFirstEquals ${value} emit `)

  /* TODO: improve type */
  // const IfFirstTrueEmitSecondValue = <B, C extends node [], D extends any[]> (first: node, second: Prop<B, C, D>) => new Prop([first, second], (s, [first, second]) => {

  //   if (first.value === false) {
  //     return {
  //       actions: []
  //     }
  //   }

  //   return {
  //     actions: [
  //       ['SET', second.value],
  //     ],
  //     value: second.value
  //   }
  // }, 'ifFirstTrueEmitSecondValue')

  // let ifFirstTrueEmitSecondValue = IfFirstTrueEmitSecondValue(ifGEqThanZero, delta)

  // let ifFirstFalse = new Prop([ifGEqThanZero, delta], (s, [ifGEqThanZero, delta]) => {
  //   if (ifGEqThanZero.value === true) {
  //     return {
  //       actions: []
  //     }
  //   }

  //   return {
  //     actions: [
  //       ['SET', delta.value],
  //     ],
  //     value: delta.value
  //   }
  // }, 'ifFirstFalse')

  // let onlyOne = new Prop([ifFirstTrueEmitSecondValue, ifFirstFalse], (s, [ifTrue, ifFalse]) => {
  //   if (ifGEqThanZero.value === true) {
  //     return {
  //       actions: []
  //     }
  //   }

  //   return {
  //     actions: [
  //       ['SET', delta.value],
  //     ],
  //     value: delta.value
  //   }
  // }, 'onlyOne')