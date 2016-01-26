import flyd from 'flyd'
import flyd_scanMerge from 'flyd/module/scanmerge'
import h from 'snabbdom/h'
import {fromJS} from 'immutable'


const init = ()=> {
  let state = fromJS({
    increment$: flyd.stream()
  , reset$: flyd.stream()
  , count: 0
  })
  // Initialize a couple streams used in the view
  let increment$ = flyd.stream()
  let reset$ = flyd.stream()
  // Now we can use scanMerge to combine all our streams into a single state stream
  return flyd_scanMerge([
    [state.get('increment$'), (state, n) => state.set('count', state.get('count') + n)]
  , [state.get('reset$'),     state => state.set('count', 0)]
  ], state)
}

// Our counter view (all the markup with event handler streams)
const view = state => 
  h('div', [
    h('p', `Total count: ${state.get("count")}`)
  , h('button', {on: {click: [state.get('increment$'), 1]}}, 'Increment!')
  , h('button', {on: {click: [state.get('increment$'), -1]}}, 'Decrement!')
  , h('button', {on: {click: state.get('reset$')}}, 'Reset!')
  ])


// Initialize our snabbdom patch function using any modules we want
let patch = require('snabbdom').init([require('snabbdom/modules/eventlisteners')])

// Plain HTML container node
let container = document.querySelector('#container')

// Initialize our state stream
let state$ = init()

// Generate a stream of new VTrees for every new value on the state stream
let vnode$ = flyd.map(view, state$)

// scan over the updated vtree with the HTML container as the starting accumulator
let dom$ = flyd.scan(patch, container, vnode$)

// Export the DOM stream so you can use it in tests
module.exports = dom$
