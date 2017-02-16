Redux store for the 311 app.

The `modules/` subdirectory contains reducers and action creators, grouped by
substate, following the "Duck" pattern:
https://github.com/erikras/ducks-modular-redux


### Action creators

store.js registers [redux-inject](https://github.com/bradharms/redux-inject) for
dependency injection, [redux-thunk](https://github.com/gaearon/redux-thunk) to give
action creators access to `dispatch` and `getStore`, and
[redux-pack](https://github.com/lelandrichardson/redux-pack) for Promise-based
async actions.

#### Type checking

Each module should export an `Action` type that is the union (`|`) of all of the
action hashes that its reducer accepts. Flow will be able to distinguish
among the cases of the type by the `type` property on the object.

In the case of redux-pack actions, set the `payload` type to `any`, since that’s
what the reducer sees.

For actions that need redux-inject dependencies, set the type of the
destructured object argument to `Deps` from the `'../store'` module.

The module index.js file will combine all of the exported `Action` types along
with catch-all types to handle redux-inject, redux-pack, and redux-thunk
action creator return values. It uses these to export a `Dispatch` type that
can accept the action creator return values as well as values that will
be processed by the middleware.

#### Examples:

Basic action creator, from arguments to a Flux Standard Action–formatted
action.

```
export type Action =
  {| type: 'ACTION_TYPE', payload: { arg1: string, arg2: string } |};

export const simpleAction = (arg1: string, arg2: string) => ({
  type: 'ACTION_TYPE',
  payload: {
    arg1,
    arg2,
  }
});
```

Asynchronous action that uses redux-inject to get our dependencies (see
`store.js` for what gets injected) and returns a `promise` key that
redux-pack will interpret and manage.



```
import type { Deps } from '../store';

export const asyncAction = (arg1: string, arg2: string) => ({ fetch }: Deps) => ({
  type: 'ACTION_TYPE',
  promise: fetch(url, {
    method: 'POST',
    body: {
      arg1,
      arg2,
    },
  }),
});
```

Action that uses redux-thunk to get access to `dispatch` and `getState`. Note that
we still need a function for redux-inject, even through we’re not injecting any
dependencies.

Also note that return values from redux-thunk go immediately back to the `dispatch`
caller and are not passed to the reducers. You always need to re-call `dispatch`
yourself from within a redux-thunk method.

Nevertheless, it’s good practice to `return` the result of `dispatch` so that
callers can get e.g. redux-pack’s `Promise`.

```
import type { Dispatch } from '.';

export const multiAction = (arg1: string, arg2: string) => () => (dispatch: Dispatch, getState: () => { val: State }) => {
  const { val } = getState();
  if (val === arg1) {
    return dispatch({
      type: 'ACTION_TYPE',
      payload: {
        arg2,
      },
    });
  }
}
```
