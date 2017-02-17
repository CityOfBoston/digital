// @flow
/* global window */

import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import type { Store as ReduxStore, Reducer } from 'redux';
import { middleware as reduxPackMiddleware } from 'redux-pack';
import thunk from 'redux-thunk';
import inject from 'redux-inject';

import keys from './keys';
import route from './route';
import request from './request';

import type { State as KeysState, Action as KeysAction } from './keys';
import type { State as RouteState, Action as RouteAction } from './route';
import type { State as RequestState, Action as RequestAction } from './request';

import type { RequestAdditions } from '../../server/next-handlers';
import makeLoopbackGraphql from '../graphql/loopback-graphql';
import type { LoopbackGraphql } from '../graphql/loopback-graphql';

export type State = {|
  keys: KeysState,
  request: RequestState,
  route: RouteState,
|};

// Here we build up the Action type that matches the allowed inputs to our
// store’s dispatch function (in other words, the valid return values for our
// action creators.)
//
// This differs from the actions that the reducers can accept due to our
// store’s installed middleware.

// These are the Actions that the individual module reducers can handle
// natively.
type ReducableAction = KeysAction | RequestAction | RouteAction;

// Action handled by redux-pack, which interprets a returned promise property
// and calls the reducer several times over its lifecycle.
type ReduxPackAction = {|
  type: string,
  promise: Promise<any>,
  meta?: Object,
|};

// Action that is handled by redux-thunk middleware, which calls the
// returned function with dispatch and getState.
// eslint-disable-next-line no-use-before-define
type ThunkAction = (dispatch: Dispatch, getState: () => State) => any;

// Action handled by redux-inject, which takes a function and calls it with
// our injected dependencies. Its return value can be any of the above actions.
// eslint-disable-next-line no-use-before-define
type InjectedAction = (Deps) => ThunkAction | ReduxPackAction | ReducableAction;

// The complete type that our dispatch accepts. Note that we don’t accept
// a ThunkAction here because any function passed to dispatch is handled by
// redux-inject. It’s only if a redux-inject function returns a function that
// redux-thunk gets called.
export type Action = InjectedAction | ReducableAction | ReduxPackAction;

// We implement our own Dispatch type to account for the actions and return
// values provided by our middleware. (The Redux built-in type is from Action
// (which must have a type property) to Action. We need to take Actions that
// don't have properties and return pretty much anything, since that’s what
// thunks can return.
export type Dispatch = (action: Action) => any;

export type Deps = {|
  loopbackGraphql: LoopbackGraphql,
|}

export type Store = ReduxStore<State, Action>;

// For the browser, we keep a singleton store that can be re-used across pages.
// A module global is the only mechanism for sharing between Next.js pages.
let browserStore = null;

// Factored out to allow for injecting test dependencies and state while
// maintaining the same middleware.
export function makeStore(deps: ?Deps = null, initialState: ?State = null): Store {
  const reducer: Reducer<State, Action> = combineReducers({
    keys,
    route,
    request,
  });

  // Support for Redux Devtools Extension: https://github.com/zalmoxisus/redux-devtools-extension
  // eslint-disable-next-line no-underscore-dangle
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
