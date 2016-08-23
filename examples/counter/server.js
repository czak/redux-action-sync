import express from 'express';
import bodyParser from 'body-parser';
import { createStore } from 'redux';
import rootReducer from './reducers';

const app = express();
const store = createStore(rootReducer);
const actions = [];

app.use(bodyParser.json());
app.use(express.static('dist'));

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
          window.__ACTION_COUNT__ = ${actions.length};
        </script>
        <script src="bundle.js"></script>
      </body>
    </html>`
  );
});

app.post('/actions', (req, res) => {
  const { index, action } = req.body;
  if (actions.length == index) {
    actions.push(action);
    store.dispatch(action);
    res.end();
  } else {
    res.status(409).json(actions.slice(index));
  }
});

app.listen(3000, () => console.log('Listening on 3000'));
