/*class State<Value, Actions = ['SET']> {
    constructor(public value: Value) {

    }
}

type InputChanges<InputsArray> = InputsArray;

class Prop<
    Value,
    InputsArray extends Array<State<any, any> | Prop<any, any, any>>,
    Actions = []
    > {

    constructor(
        public inputs: I1,
        public fn: (
            subChanges: any[],
            inputChanges: InputChanges<I0>
        )
    );

    constructor(
        public inputs: InputsArray,
        public fn: (
            subChanges: any[],
            inputChanges: InputChanges<InputsArray>,
            oldValue: Value
        ) => {
            value: Value,
            actions: Actions
        }
    ) {

    }
}

const a = new State(3)
const b = new State<string, ['SET', 'ADD']>('b')

const p1 = new Prop([a, b], function(subChanges, inputChanges) {
    return {
        value: 's',
        actions: []
    };
})


class Test<A, B> {
    constructor(m: B, fn: (a: A) => A) {

    }
}

const m = new Test(2, function (a) { return 'a' })


class Gener<X> {

}

type Extracts<I, P>

let o = new Gener<number>();
*/


/* type ActionsFor<M extends (A | B)[]> = M extends [] ? string : (
    M extends [any] ? null : number
);

class Over<Inputs extends (A | B)[]> {
    constructor(i: Inputs, z: ActionsFor<Inputs>) {

    }
}

new Over([ new A() ], 1);*/


/*
type First<T> =
  T extends [infer U, ...unknown[]]
    ? [{ test: U }]
    : never;

type SomeTupleType = [string, number, boolean];
type FirstElementType = First<SomeTupleType>; // string

*/


/*const notTuple = [1, 's', 5];

function make<M>(i: M) {
    return i;
}

const other = make<[1, 's', 5]>(notTuple);*/

/* class A<T> { 
    private test = true

    constructor() {

    }
}

class B<T> { 

    private test2 = true

    constructor() {
        
    }

}

class OtherT {
    private test2 = true;
}

type Extrac<M> = M extends A<(infer R)> ? R : never; 

type Summary<T> = { [P in keyof T]: {
    result: T[P] extends INode ? Extrac<T[P]> : never;
    }
};

type INode = A<any> | B<any>;

declare function all<T extends [INode] | INode[]>(values: T): Summary<T>;

function f1(a: number, b: Promise<number>, c: string[], d: Promise<string[]>) {
    let x1 = all([new A<number>()]);  // Promise<[number]
    let x2 = all([new A, new B]);  // Promise<[number, number]>
    let x3 = all([a, b, c]);  
    let x4 = all([a, b, c, d]);  

}

constructor(
    public inputs: T, 
    public fn: ResolveFn<InputsArray, Value, Actions>, 
    public label: string
  )

*/