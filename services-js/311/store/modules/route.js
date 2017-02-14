// @flow
//
// Module for matching Redux store state to the Next router. Requires the
// withStoreRoute HOC to be mixed in to the page component.

type Query = {[key: string]: string};

type RoutePayload = {|
  pathname: string,
  query: Query,
  as: ?string,
|}

export type State = {
  pathname: ?string,
  query: ?Query,
  as: ?string,
}

export type Action = {| type: 'ROUTE_SET', payload: RoutePayload |};

// Causes navigation to the given Next pathname and query, using the "as"
// value for the window.location.
//
// Use this to trigger a route change from component code.
export const navigate = (pathname: string, query: Query, as: string): Action => ({
  type: 'ROUTE_SET',
  payload: { pathname, query, as },
});

// Updates the state based on a route change that happened. Should only be
// called by withStoreRoute.
export const setRoute = (pathname: string, query: Query): Action => ({
  type: 'ROUTE_SET',
  payload: { pathname, query, as: null },
});

const DEFAULT_STATE = {
  pathname: null,
  query: null,
  as: null,
};

export default function reducer(state: State = DEFAULT_STATE, action: Action): State {
  switch (action.type) {
    case 'ROUTE_SET':
      return {
        ...state,
        pathname: action.payload.pathname,
        query: action.payload.query,
        as: action.payload.as,
      };

    default:
      return state;
  }
}
