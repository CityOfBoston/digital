// @flow
/* global window */
/* eslint no-underscore-dangle: 0 */

import { createStore, compose, applyMiddleware } from 'redux';
import type { Store as ReduxStore } from 'redux';
import { middleware as reduxPackMiddleware } from 'redux-pack';
import thunk from 'redux-thunk';
import inject from 'redux-inject';

import type { RequestAdditions } from '../server/next-handlers';
import { reducer } from './modules';
import type { AppState, AppAction } from './modules';
import makeLoopbackGraphql from './deps/loopback-graphql';
import type { LoopbackGraphql } from './deps/loopback-graphql';

// Re-export these to keep things centralized in the “store” module.
export type State = AppState;
export type Action = AppAction;

export type Store = ReduxStore<State, Action>;

export type Deps = {|
  loopbackGraphql: LoopbackGraphql,
|}

// We implement our own Dispatch type to account for the actions and return
// values provided by our middleware. (The Redux built-in type is from Action
// (which must have a type property) to Action. We need to take Actions that
// don't have properties and return pretty much anything, since that’s what
// thunks can return.
export type Dispatch = (action: Action) => any;

// For the browser, we keep a singleton store that can be re-used across pages.
// A module global is the only mechanism for sharing between Next.js pages.
let browserStore = null;

// Factored out to allow for injecting test dependencies and state while
// maintaining the same middleware.
export function makeStore(deps: ?Deps = null, initialState: ?State = null): Store {
  // Support for Redux Devtools Extension: https://github.com/zalmoxisus/redux-devtools-extension
  const composeEnhancers = (process.browser && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

  const enhancers = composeEnhancers(
    applyMiddleware(
      inject(deps),
      thunk,
      reduxPackMiddleware,
    ),
  );

  if (initialState) {
    return createStore(reducer, initialState, enhancers);
  } else {
    return createStore(reducer, enhancers);
  }
}

/**
 * Returns a Redux store for this application. For the server, always returns a
 * fresh store with the given initialState. On the browser, will always return
 * the same store and initialState is ignored after the first call.
 *
 * req is the Node request (expected to contain injected dependencies for server
 * data fetching) that should be provided when creating the store for the
 * server’s getInitialProps calls. Can be null when server rendering or on the
 * client.
 */
export default function getStore(req: ?RequestAdditions, initialState: ?State = null): Store {
  if (process.browser && browserStore) {
    return browserStore;
  }

  const deps = {
    loopbackGraphql: makeLoopbackGraphql(req),
  };

  const store = makeStore(deps, initialState);

  if (process.browser) {
    browserStore = store;
  }

  return store;
}
