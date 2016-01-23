import flyd from 'flyd'
import flyd_scanMerge from 'flyd/module/scanmerge'
import h from 'snabbdom/h'

// Initialize a couple streams used in the view
let increment$ = flyd.stream()
let reset$ = flyd.stream()

// Our counter view (all the markup with event handler streams)
const view = state => 
  h('div', [
    h('p', `Total count: ${state}`)
  , h('button', {on: {click: [increment$, 1]}}, 'Increment!')
  , h('button', {on: {click: [increment$, -1]}}, 'Decrement!')
  , h('button', {on: {click: reset$}}, 'Reset!')
  ])


// Now we can use scanMerge to combine all our streams into a single state stream
let state$ = flyd_scanMerge([
  [increment$, (count, n) => count + n]
, [reset$,     count => 0]
], 0)

// Initialize our snabbdom patch function using any modules we want
let patch = require('snabbdom').init([require('snabbdom/modules/eventlisteners')])

// Plain HTML container node
let container = document.querySelector('#container')

// Generate a stream of new VTrees for every new value on the state stream
let vnode$ = flyd.map(view, state$)

// scan over the updated vtree with the HTML container as the starting accumulator
let dom$ = flyd.scan(patch, container, vnode$)

// Export the DOM stream so you can use it in tests
module.exports = dom$
