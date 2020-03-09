# ReactiveState

A library for State Management and Automatic Property Resolution.

## Why?

Managing Application State is often difficult due to the following:
* Listening for state changes (including Granular changes)
* Filtering out impossible actions before they happen (Action proxying).
* Atomic Updates.

Similarly, Property Resolution presents its challenges:
* Deciding when to Recompute
* Order of resolution (topological sort)
* Reacting to an Action or to a value change.

ReactiveState solves the problems above.

## How to Use It

1. Install it using: `npm i @stackomate/reactive-state --save`
2. Import and use in your application:
```typescript
import {initialize, State, Prop} from '@stackomate/reactive-state'

let firstState = State(12, 'myFirstState');
let prop = Prop([firstState], ([firstState], oldInputs, action) => {
    return firstState > 10;
})

initialize([firstState]);

```

If you have n isles in your graph, provide n elements, each from one isle.
That way reactive-state can traverse all the State and Prop objects.

## Examples
### Quadratic Equation

```typescript
import {initialize, State, Prop} from '@stackomate/reactive-state'

let a = State(1, 'a');
let b = State(-5, 'b');
let c = State(6, 'c');

let delta = Prop([a, b, c], ([a, b, c]) => b**2 - 4 * a * c)

let squareRootDelta = Prop([delta], ([delta]) => Math.sqrt(delta));

let x1 = Prop([b, a, squareRootDelta], ([b, a, squareRootDelta]) => {
    return (-b + squareRootDelta)/(2*a)
})

let x2 = Prop([b, a, squareRootDelta], ([b, a, squareRootDelta]) => {
    return (-b - squareRootDelta)/(2*a)
})

let nSolutions = ([delta], ([delta]) => {
    if (delta > 0) return 2;
    if (delta === 0) return 1;
    return 0;
})

initialize([firstState]);

```


# ReactiveState

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.19.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
