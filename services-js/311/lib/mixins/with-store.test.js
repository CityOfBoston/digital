// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import { createStore } from 'redux';
import { connect } from 'react-redux';

import withStore from './with-store';

const INITIAL_STATE = {
  step: 'first',
};

function reducer(state = INITIAL_STATE) {
  return state;
}

function getStore(initialState) {
  return createStore(reducer, initialState);
}

class TestPage extends React.Component {
  static getInitialProps(ctx, store) {
    return Promise.resolve({
      initialStep: store.getState().step,
    });
  }

  render() { return <span>{ this.props.renderStep }</span>; }
}

const TestPageContainer = connect((state) => ({
  renderStep: state.step,
}))(TestPage);

let ctx;
let Wrapped;
beforeEach(() => {
  ctx = {
    req: ({}: any),
    res: (({ statusCode: 200 }): any),
    pathname: '/page',
    query: {},
  };

  Wrapped = withStore(getStore)(TestPageContainer);
});

describe('getInitialProps on server', () => {
  it('creates a store and calls through to the wrapped component, also returns initial state', async () => {
    const initialProps = await Wrapped.getInitialProps(ctx);
    expect(initialProps).toEqual({
      initialStep: 'first',
      initialState: INITIAL_STATE,
    });
  });

  it('pulls the initialState off of the request', async () => {
    const SERVER_STATE = {
      step: 'second',
    };

    ctx.req.reduxInitialState = SERVER_STATE;

    const initialProps = await Wrapped.getInitialProps(ctx);
    expect(initialProps).toEqual({
      initialStep: 'second',
      initialState: SERVER_STATE,
    });
  });
});

describe('getInitialProps on client', () => {
  beforeEach(() => {
    ctx.req = null;
    ctx.res = null;
  });

  it('creates a store and calls through to the wrapped component, also returns initial state', async () => {
    const initialProps = await Wrapped.getInitialProps(ctx);
    expect(initialProps).toEqual({
      initialStep: 'first',
      initialState: INITIAL_STATE,
    });
  });
});


describe('render', () => {
  it('renders the wrapped component in a Provider', async () => {
    const SERVER_STATE = {
      step: 'second',
    };

    ctx.req.reduxInitialState = SERVER_STATE;
    const initialProps = await Wrapped.getInitialProps(ctx);
    const component = renderer.create(<Wrapped {...initialProps} />);
    expect(component.toJSON()).toEqual({ children: ['second'], props: {}, type: 'span' });
  });
});
