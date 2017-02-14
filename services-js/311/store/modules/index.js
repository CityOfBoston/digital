// @flow
//
// Combines the exported reducers, State and Action types across all of the
// modules to provide single values to the store module.

import { combineReducers } from 'redux';
import type { Reducer } from 'redux';

import type { Deps, Dispatch } from '../';
import keys from './keys';
import services from './services';
import route from './route';
import request from './request';

import type { State as KeysState, Action as KeysAction } from './keys';
import type { State as ServicesState, Action as ServicesAction } from './services';
import type { State as RouteState, Action as RouteAction } from './route';
import type { State as RequestState, Action as RequestAction } from './request';

export type AppState = {|
  keys: KeysState,
  services: ServicesState,
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
type ReducableAction = KeysAction | RequestAction | RouteAction | ServicesAction;

// Action handled by redux-pack, which interprets a returned promise property
// and calls the reducer several times over its lifecycle.
type ReduxPackAction = {|
  type: string,
  promise: Promise<any>,
  meta?: Object,
|};

// Action that is handled by redux-thunk middleware, which calls the
// returned function with dispatch and getState.
type ThunkAction = (dispatch: Dispatch, getState: () => AppState) => any;

// Action handled by redux-inject, which takes a function and calls it with
// our injected dependencies. Its return value can be any of the above actions.
type InjectedAction = (Deps) => ThunkAction | ReduxPackAction | ReducableAction;

// The complete type that our dispatch accepts. Note that we don’t accept
// a ThunkAction here because any function passed to dispatch is handled by
// redux-inject. It’s only if a redux-inject function returns a function that
// redux-thunk gets called.
export type AppAction = InjectedAction | ReducableAction | ReduxPackAction;

export const reducer: Reducer<AppState, AppAction> = combineReducers({
  keys,
  services,
  route,
  request,
});
