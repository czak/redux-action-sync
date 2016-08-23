import { createStore } from 'redux';
import rootReducer from './reducers';

const store = createStore(
  rootReducer,
  window.__PRELOADED_STATE__
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
