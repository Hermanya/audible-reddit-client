import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './visible/containers/App'
import configureStore from './programmable/store/configureStore'
import audible from './audible/app'

window.store = configureStore()

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

audible(store)
document.body.style.filter = 'blur(2px)'
document.body.style['-webkit-filter'] = 'blur(2px)'
