# redux-action-sync

`redux-action-sync` is an action persistence middleware for [Redux][redux] applications. A simple solution for keeping state synchronised across multiple clients. It uses a single-endpoint backend as an alternative to CRUD APIs.

See it in action: [todomvc-action-sync][]

Please treat what you see as an experiment, an idea being explored with code.

[redux]: http://redux.js.org/
[todomvc-action-sync]: http://

## Premise

The idea of action synchronization stems from the [principles of Redux](http://redux.js.org/docs/introduction/ThreePrinciples.html):

* State is read-only
* The only way to change the state is to emit an action

What follows is the main premise of `redux-action-sync`:

> Replaying a sequence of actions can be used to recreate the application state.

Redux actions - being simple, serializable Javascript objects - can be easily stored and transferred. Ensuring the same sequence of actions on all clients guarantees consistent state across them. This is the job of `redux-action-sync`.

All the above make action log a viable persistence format for certain applications. Obviously this approach yields certain [benefits][] as well as [disadvantages][].

## Usage

A complete system with action synchronization requires the following:

### 1. Set up a backend

This step is entirely up to you. Your backend must persist a list of actions and compare two numbers with each other. The following is a basic [Express][express] backend with a single HTTP JSON endpoint and in-memory store:

```javascript
const router = require('express').Router();
const actions = [];

router.use(require('body-parser').json());

router.post('/actions', (req, res) => {
  const index = req.body.index;
  if (actions.length == index) {
    actions.push(req.body.action);
    res.end();
  } else {
    res.status(409).json(actions.slice(index));
  }
});

module.exports = router;
```

### 2. Implement `push`

The `push` function is the glue between the client and your backend. `redux-action-sync` will use it to push all client-initiated actions to the backend. The method must fulfill certain requirements. For more details, see [API][#api].

For the Express backend above, an implementation of `push` using the [axios][] HTTP client may look like the following:

```javascript
const push = (index, action) =>
  axios.post('http://localhost:4000/actions', { index, action })
       .catch(error => {
         throw Object.assign(error, { conflicts: error.response.data });
       })
```

### 3. Apply the middleware to your store

Finally, apply the middleware to your Redux store:

```javascript
import createActionSync from 'redux-action-sync';

const store = createStore(
  rootReducer,
  applyMiddleware(
    createActionSync(push)
  )
);
```

## TODO

* how it works
  * overview
    * as user interacts with a Redux app, actions are dispatched
    * each action is pushed to a backend
    * client maintains a counter of successfully dispatched & pushed actions
      called actionCount
    * upon successful push, actionCount is incremented by one
    * when the backend detects a conflict, it rejects the push and provides a list
      of actions which need to be dispatched first
      * the client dispatches the received "conflict actions" and retries the push
  * diagram with simple successful push
  * diagram with a push conflict
* api
  * createActionSync
    * specify push
  * push(index, action)
    * must return a Promise; resolve when push was accepted; reject with
      conflicting actions when conflict was detected
* advantages
  * super-simple backend implementation is possible
  * write-only (no updates and no deletes)
  * ensuring synchronization across clients becomes trivial
  * a single backend implementation can work across multiple redux apps
  * the redux-action-sync implementation is backend-agnostic; you provide your
    own pushing code
* disadvantages
  * storage only grows
  * recreating store from a long sequence of actions could take a long time
    * this can (should) be alleviated by persisting state (locally or on the
      server) and proceeding from then on
* what this is not good for
  * applications where the client state is only a small window into the
    available data; most CRUDs with pagination will fit this description
  * realtime apps
* what this is good for
  * applications with a small redux state; "small" is obviously relative, but if
    you can imagine the client containing the entirety of user's data in its
    redux state, then you might want to look into it
  * applications where conflicts are relatively rare (so the conflict resolution
    doesn't disrupt user's experience)
* todo
  * manual state rehydration
  * optimistic updates
  * server-side component
    * server could maintain its own redux state and provide it with initial
      render; only the subsequent updates would use the middleware; this would
      alleviate the need for locaStorage persistence
* license
  * MIT
