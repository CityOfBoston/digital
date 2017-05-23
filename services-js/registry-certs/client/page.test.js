// @flow
/* eslint no-underscore-dangle: 0 react/prefer-stateless-function: 0 */

import React from 'react';
import renderer from 'react-test-renderer';

import page from './page';

jest.mock('next/router');

const Router = require('next/router').default;

function runEachTestInBrowser() {
  beforeEach(() => {
    process.browser = true;
    window.__NEXT_DATA__ = {};
  });

  afterEach(() => {
    process.browser = false;
  });
}

describe('creation', () => {
  describe('browser', () => {
    runEachTestInBrowser();

    it('does browser setup on the browser', () => {
      page(({}: any));

      expect(Router.onRouteChangeStart).toBeDefined();
    });
  });
});

describe('getInitialProps', () => {
  it('returns empty when the wrapped component has no getInitialProps', () => {
    const Page: any = page(
      class extends React.Component {},
    );

    expect(Page.getInitialProps({})).toEqual({});
  });

  it('passes dependencies to the wrapped component', () => {
    let passedDependencies;

    const Page: any = page(
      class extends React.Component {
        static getInitialProps(context, dependencies) {
          passedDependencies = dependencies;

          return {
            innerClass: true,
          };
        }
      },
    );

    expect(Page.getInitialProps({})).toEqual({ innerClass: true });
    expect(passedDependencies).toBeDefined();
  });
});

describe('rendering', () => {
  let Page;

  beforeEach(() => {
    Page = page(
      class extends React.Component {
        render() {
          return <div data-cart={this.props.cart} />;
        }
      },
    );
  });

  it('passes dependencies to the wrapped component', () => {
    const json = renderer.create(<Page />).toJSON();
    expect(json.props['data-cart']).toBeDefined();
  });

  describe('server', () => {
    it('has different dependencies for different components', () => {
      const json1 = renderer.create(<Page />).toJSON();
      const json2 = renderer.create(<Page />).toJSON();
      expect(json1.props['data-cart']).not.toBe(json2.props['data-cart']);
    });
  });

  describe('browser', () => {
    runEachTestInBrowser();

    it('passes the same dependencies to several components', () => {
      const json1 = renderer.create(<Page />).toJSON();
      const json2 = renderer.create(<Page />).toJSON();
      expect(json1.props['data-cart']).toBe(json2.props['data-cart']);
    });
  });
});
