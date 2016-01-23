
# Functional Frontend Architecture

This is an example of a simple but robust functional frontend architecture, based on the Elm Architecture but further simplified, using only two libs:

- [flyd](https://github.com/paldepind/flyd) for Functional Reactive Programming
- [snabbdom](https://github.com/paldepind/snabbdom) for Virtual DOM

More optional bonuses:

- with plain js data structures, make use of [Ramda](ramdajs.com)
- To have immutable data and vdom-thunking, use [Immutable.js](https://facebook.github.io/immutable-js/docs/)

# High-Level Overview

Making a UI module:

- The app consists of independent UI modules
- UI modules can be nested and combined. They are hierarchical, similar to the DOM.
- Each module exports 3 basic components
  - View: a main 'view' function that takes a state and renders a Virtual DOM Tree
  - Event streams: any number of event streams that constitute the actions of the module's UI
  - State stream: a single stream of module's state derived from the different event streams, combined together using scanMerge and lift

Using UI modules:

- First, import `childModule`, which gives you a view, events, and state stream
- Call `childModule.view` within the parent's view function to embed the markup.
- Use `flyd/module/lift` to merge the child module's state stream into your parent module's state stream
- Use the child module's event streams directly if you need to set behavior in the child from the parent

Rendering onto the page:

- Use `flyd.map` on your parent module's view function over your state stream to produce a stream of new Virtual DOMs
- Scan that stream of Virtual DOMs with the snabbdom patch function and an initial HTML container

Testing your UI:

- Given your module's state stream, view function, and event streams
  - Easily unit-test your pure view functions by passing in mocked-up state and querying the resulting HTML
  - Easily unit-test your pure update functions by passing in a mockup state and data and checking the resulting state
  - Easily integration-test your full UI by pushing test data onto your module's event streams and querying the resulting DOM stream

## Some advantages of this architecture

- Much easier to quickly understand in my opinion than many other similar architectures
- Only two libs, and you can very easily use immutable/mori/etc and make use of vdom 'thunking'
- Very easy to test
- Mostly purely functional

# Examples

## Counter

A single-module, very simple example to get you started with the idea. The user clicks one of three buttons and watches the number change in the view.

[View the source](examples/counter/index.es6)

# scanMerge-ing events together

Use `flyd/module/scanMerge` to combine events from your view into a single state stream.

The streams on the left can be any flyd stream, and the functions on the right are state-updater functions and take the current state and a value from the stream, and return a new state.

```js
let state$ = flyd.immediate(flyd_scanMerge([
  [addTodo$,      (state, formObj) => state.set('todos', state.get('todos').add(formObj))]
, [removeTodo$,   (state, idx)     => state.set('todos', state.get('todos').delete(idx))]
, [toggleTodo$,   (state, idx)     => state.setIn(['todos', idx, 'finished'], !state.getIn(['todos', idx, 'finished']))]
, [editTodo$,     (state, data)    => state.setIn(['todos', data.idx, 'name'], data.name)]
], defaultState))
```

# How to nest modules

If you have a parent module and want to embed child modules, you can use flyd/module/lift:

```js
// Embed any number of child module's state streams into the state stream for a parent module:
// (assume $parentState is already initialized)
let parentState$ = flyd.lift(
  (s1, s2, s3, parent) => parent.set('child1', s1).set('child2', s2).set('child3', s3)
, parentState$
, childModuleState1$
, childModuleState2$
, childModuleState3$
)
```

# Render a module onto the page
