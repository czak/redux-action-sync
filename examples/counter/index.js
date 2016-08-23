import { createStore, applyMiddleware } from 'redux';
import axios from 'axios';
import rootReducer from './reducers';
import createActionSync from '../../src';

const push = (index, action) =>
  axios.post('/actions', { index, action })
       .catch(error => {
         throw Object.assign(error, { conflicts: error.response.data });
       })

const store = createStore(
  rootReducer,
  window.__PRELOADED_STATE__,
  applyMiddleware(
    createActionSync(push, window.__ACTION_COUNT__)
  )
);

// re-render on dispatch
store.subscribe(() => {
  document.getElementById('value').textContent =
    store.getState().toString();
});

// Bind click handlers to buttons
document.getElementById('increment')
  .addEventListener('click', () => {
    store.dispatch({ type: 'INCREMENT' });
  });

document.getElementById('decrement')
  .addEventListener('click', () => {
    store.dispatch({ type: 'DECREMENT' });
  });
