import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import createActionSync from '../../lib'
import axios from 'axios';

const push = (index, action) => {
  return axios.post('/actions', { index, action })
       .catch(error => {
         throw Object.assign(error, { conflicts: error.response.data });
       })
}

export default function configureStore(preloadedState) {
  const store = createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(
      createActionSync(push)
    )
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
