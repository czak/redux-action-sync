import express from 'express';
import { createStore } from 'redux';
import rootReducer from './reducers';

const app = express();
const store = createStore(rootReducer);

app.get('/', (req, res) => {
  res.send(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>redux-action-sync basic example</title>
      </head>
      <body>
        <p>
          Clicked: <span id="value">${store.getState()}</span> times
          <button id="increment">+</button>
          <button id="decrement">-</button>
        </p>
        <script>
          window.__PRELOADED_STATE__ = ${store.getState()};
        </script>
        <script src="bundle.js"></script>
      </body>
    </html>`
  );
});

app.use(express.static('public'));

app.listen(3000, () => console.log('Listening on 3000'));
