# redux-action-sync

![](https://codeship.com/projects/172335/status?branch=master)

`redux-action-sync` is an action persistence middleware for [Redux][redux]
applications. A simple solution for keeping state synchronised across multiple
clients. It uses a single-endpoint backend as an alternative to CRUD APIs.

See it in action: [todomvc-action-sync][]

Please treat what you see as an experiment, an idea being explored with code.

[redux]: http://redux.js.org/
[todomvc-action-sync]: https://todomvc-action-sync.herokuapp.com/

## Premise

The idea of action synchronization stems from the [principles of
Redux](http://redux.js.org/docs/introduction/ThreePrinciples.html):

* State is read-only
* The only way to change the state is to emit an action

What follows is the main premise of `redux-action-sync`:

> Replaying a sequence of actions can be used to recreate the application state.

Redux actions - being simple, serializable Javascript objects - can be easily
stored and transferred. Ensuring the same sequence of actions on all clients
guarantees consistent state across them. This is the job of `redux-action-sync`.

All the above make action log a viable persistence format for certain
applications. Obviously this approach yields certain [benefits](#benefits) as
well as [disadvantages](#disadvantages).

## Usage

A complete system with action synchronization requires the following:

### 1. Set up a backend

This step is entirely up to you. Your backend must persist a list of actions and
compare two numbers with each other. The following is a basic [Express][express]
backend with a single HTTP JSON endpoint and in-memory store:

[express]: https://expressjs.com

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

The `push` function is the glue between the client and your backend.
`redux-action-sync` will use it to push all client-initiated actions to the
backend. The method must return a Promise. For more details, see [API](#api).

For the Express backend above, an implementation of `push` using the [axios][]
HTTP client may look like the following:

[axios]: https://github.com/mzabriskie/axios

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

## How it works

As a user interacts with a Redux app, actions are dispatched. The middleware
intercepts each action and pushes it to a backend. It also maintains a counter
of successfully dispatched and pushed actions, called `actionCount`.

A `push` can result in either of the two scenarios:

### Scenario 1: a successful push

This scenario represents a situation when the client & server are in sync.

1. A user performs an action in the UI
2. `redux-action-sync` intercepts and pushes the action to the backend and
   specifies its current `actionCount`
3. The backend confirms it currently holds `actionCount` actions in its store
   and appends the new one
4. The `push` promise is successfully resolved and `redux-action-sync`
   continues with the action dispatch
5. `redux-action-sync` increments its `actionCount` by 1

### Scenario 2: push conflicts

This scenario represents a situation when the server is ahead of the client,
i.e. holds more actions than the client knows of. They work together to bring
the client up to date.

1. A user performs an action in the UI
2. `redux-action-sync` intercepts and pushes the action to the backend and
   specifies its current `actionCount`
3. The backend detects it currently holds **more than** `actionCount` actions in
   its store. It rejects the push and returns a list of all actions stored at
   index `actionCount` and above.
4. `redux-action-sync` dispatches all the received received actions and
   increments its `actionCount` for each one
5. `redux-action-sync` retries the push (i.e. goto step 2) until the backend
   accepts the push

## API

* `createActionSync(push)`
  * this is the default (and only) export of `redux-action-sync`
  * provide your `push` function as the only argument
  * returns the middleware function

A valid `push` implementation looks as follows:

* `push(index, action)`
  * arguments:
    * `index`: an integer with the current `actionCount` value. Use it to tell the
      backend "I want this new action at `index`"
    * `action`: the action being pushed
  * returns: a Promise
    * the Promise should fulfill when the push was accepted by the backend (e.g.
      backend returns `200 OK`)
    * the Promise should reject when the push was rejected by the backend. The
      error must contain an Array of conflicting actions in its `conflicts`
      field.

## Benefits

This approach allows for trivial backend implementations:

* append only, no updates and no deletes
* ensuring synchronization across clients requires only a simple number
  comparison

Furthermore, a single backend implementation is universal and can work across
multiple Redux apps with no changes.

## Disadvantages

* The storage always grows, even if actual data is deleted by user
* Recreating store from a long sequence of actions may take a long time
  * This can (should) be alleviated by persisting state (locally or on the
    server) and proceeding from then on

## What this is good for

* Applications with a small Redux state
  * "small" is obviously relative, but if you can imagine the client containing
    the entirety of user's data in its redux state, then you might want to look
    into it
* Applications where conflicts are relatively rare (so the conflict resolution
  doesn't disrupt user's experience)

## What this is not good for

* Applications where the client state is only a small window into the
  available data
  * most CRUDs with pagination will fit this description
* Realtime apps

## Todo

* [ ] manual state rehydration
* [ ] optimistic updates
* [ ] server-side component
* [ ] offline support (queueing & batching actions to sync)

### License

MIT
