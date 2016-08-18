# redux-action-sync

* what is redux-action-sync
  * a persistence middleware for Redux apps
  * a super-simple solution for synchronizing state across clients
  * a single-endpoint alternative to CRUD backends
  * see in action - todomvc-action-sync
  * please treat this as an experiment, and idea being explored as we speak
* premise
  * based on the principles of redux:
    * state is read-only
    * the only way to change the state is to emit an action
  * what follows is the main premise of redux-action-sync
    * replaying a sequence of actions can be used to recreate the application
      state
  * actions - being simple serializable Javascript objects - can be easily
    transferred and stored
  * all the above make action log a viable persistence format
  * thus, we persist actions, not state
  * this approach yields certain #benefits, as well as #disadvantages
* usage
  * ras is only a piece in a larger idea, but all components are simple
  * first implement a backend
    * (a node example with in-memory store follows)
  * then provide your push function (see #api for more details)
    * (an axios example follows)
  * finally, apply the middleware to your store
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
