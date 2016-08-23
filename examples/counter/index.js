import { createStore } from 'redux';
import rootReducer from './reducers';

const store = createStore(rootReducer);

const render = () => {
  document.getElementById('value').textContent =
    store.getState().toString();
};

// Initial render & re-render on dispatch
render();
store.subscribe(render);


// Bind click handlers to buttons
document.getElementById('increment')
  .addEventListener('click', () => {
    store.dispatch({ type: 'INCREMENT' });
  });

document.getElementById('decrement')
  .addEventListener('click', () => {
    store.dispatch({ type: 'DECREMENT' });
  });
