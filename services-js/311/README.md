<img src="https://cloud.githubusercontent.com/assets/9234/19400090/8c20c53c-9222-11e6-937c-02bce55e5301.png" alt="City of Boston" width="150" />

The source code for the future [311.boston.gov](https://311.boston.gov).

[![Build Status](https://travis-ci.org/CityOfBoston/311.svg?branch=develop)](https://travis-ci.org/CityOfBoston/311)
[![codecov](https://codecov.io/gh/CityOfBoston/311/branch/develop/graph/badge.svg)](https://codecov.io/gh/CityOfBoston/311)

## Developers

This is a Node project using the [Next.js](https://github.com/zeit/next.js/)
framework for server-side rendering.

[Yarn](https://yarnpkg.com/) is recommended.

 * **Development Server**: `yarn dev` <http://localhost:3000/>
 * **React Storybook**: `yarn storybook` <http://localhost:9001/>
 * **Gulp**: `yarn gulp watch`
 * **Tests**: `yarn test` or `yarn test -- --watch`
 * **Lint**: `yarn lint` (uses [ESLint](http://eslint.org/) `--fix` to fix common style errors)
 * **Typecheck**: `yarn flow`

### Getting started

 1. Get the Open311 api_key and URL from a friend
 1. Copy `.env.sample` to `.env` and fill in the endpoint and keys
 1. Get other API keys: Mapbox, Searchly, &c. and put them in .env
 1. `yarn install`
 1. `yarn gulp watch`
 1. `yarn dev`
 1. Visit <http://localhost:3000/> in your browser

### JavaScript

This project uses [Babel](https://babeljs.io/) at the
“[latest](https://babeljs.io/docs/plugins/preset-latest/)” preset to include
ES2015–17, as well as the
“[next/babel](https://github.com/zeit/next.js/blob/master/server/build/babel/preset.js)”
preset.

Please make full use of:

 * [Object rest spread](https://babeljs.io/docs/plugins/transform-object-rest-spread/): `{ foo: 1, ...bar }`
 * [Async functions](https://babeljs.io/docs/plugins/transform-async-to-generator/): `async (promisedNum) => (3 + await promisedNum)`
 * [Class properties](https://babeljs.io/docs/plugins/transform-class-properties/): `class MyComponent { onClick = () => { this.setState({ clicked: true })} }`

Code style is enforced by ESLint, which can be run (in `--fix` mode) with
`yarn lint`. Committed code must contain no errors or warnings. On a per-file
basis, certain errors may be turned off. For example, to keep a class-based
component:

```
// eslint react/prefer-stateless-function: 0
```

### Type-checking

We use Flow type checking to ensure that modules are integrated together
in a typesafe way. All source, test, and story files should start with
`// @flow` to enable type checking.

We use [flow-typed](https://github.com/flowtype/flow-typed) to provide Flow
types for supported NPM modules, and have added our own under `/flow-typed/npm`.

We use [apollo-codegen](https://github.com/apollographql/apollo-codegen) to
generate Flow types for the `*.graphql` queries and mutations in
`/store/modules/graphql`. These are output as
`/store/modules/graphql/schema.flow.js` and should be used when possible to
establish types for GraphQL arguments and responses.

Run `yarn flow` to check types.

### Backend

This project starts a [Hapi](https://hapijs.com/) server and uses Next.js’s
[custom server & routing](https://github.com/zeit/next.js#custom-server-and-routing)
support to serve HTML and JS. It runs the
[Apollo GraphQL server](https://github.com/apollographql/graphql-server) to
facilitate communication with the client code.

Server-only code, including the GraphQL schema and resolvers, is in the
`/server` directory.

The Gulp `graphql:schema` and `graphql:types` tasks are automatically run by
`gulp watch` to update the schema and type files when code in `server/graphql`
changes.

**Backend debugging with Charles:**
`env NODE_TLS_REJECT_UNAUTHORIZED=0 http_proxy=http://localhost:8888/ yarn dev`

### Frontend

The Next.js framework turns components in the `/pages` directory into entry
points for the app. These are wrapped in higher-order components to provide
common setup for our store and Glamor CSS setup.

The MobX store is configured in the `/data/store` directory. Access to the
GraphQL backend is mediated through the function modules in `/data/dao`.

Components and containers are organized under `/components` by page.

For UI-focused development, use [React Storybook](https://getstorybook.io/) by
running `yarn storybook` and visiting <http://localhost:9001>

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [LICENSE](LICENSE.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.

## Contributions

If you're interested in helping this project, there are three ways to help. Be sure to checkout our [Guide to Contributing](https://github.com/CityOfBoston/boston.gov/blob/develop/guides/03-contributing-to-boston.gov.md).

* [Report issues on Boston.gov](https://github.com/CityOfBoston/boston.gov/blob/develop/guides/03-contributing-to-boston.gov.md#reporting-bugs)
* [Suggest new features](https://github.com/CityOfBoston/boston.gov/blob/develop/guides/03-contributing-to-boston.gov.md#suggest-new-features)
* [Contributing to development](https://github.com/CityOfBoston/boston.gov/blob/develop/guides/03-contributing-to-boston.gov.md#contributing-to-development)
