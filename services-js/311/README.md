<img src="https://cloud.githubusercontent.com/assets/9234/19400090/8c20c53c-9222-11e6-937c-02bce55e5301.png" alt="City of Boston" width="150" />

The source code for the future [311.boston.gov](https://311.boston.gov).

[![Build Status](https://travis-ci.org/CityOfBoston/311.svg?branch=develop)](https://travis-ci.org/CityOfBoston/311)

### todo note: 9/23/19

All apps have been upgraded from Next.js 8.x.x => 9.x.x **except** for this one!

After upgrading (along with Babel from 7.1.x to 7.6.x), running Jest throws

```
[mobx] Encountered an uncaught exception that was thrown by a reaction or observer component, in: 'Reaction[RecentRequestRow#3350.render()] { Invariant Violation: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

Since this application is not in production and it is unknown whether it ever will be, it was decided to leave it as-is for the time being.

## Developers

This is a Node project using the [Next.js](https://github.com/zeit/next.js/)
framework for server-side rendering.

- **Development Server**: `npm run dev` <http://localhost:3000/>
- **React Storybook**: `npm run storybook` <http://localhost:9001/>
- **Tests**: `npm test` or `npm test -- --watch`
- **Lint**: `npm run lint` (uses [ESLint](http://eslint.org/) `--fix` to fix common style errors)

### Getting started

**Make sure you have at least Node 8.2 installed, preferrably with `nvm` or
equivalent so you automatically pick up our `.nvmrc` file. Also, `npm` >= 5.3
(installed by default with Node 8.2 and up) and `gulp-cli`.**

1.  Get the Open311 api_key and URL from a friend
1.  Copy `.env.sample` to `.env` and fill in the endpoint and keys
1.  Get other API keys: Mapbox, Searchly, &c. and put them in .env
1.  `yarn install`
1.  `yarn dev`
1.  Visit <http://localhost:3000/> in your browser

### JavaScript

This project uses [Babel](https://babeljs.io/) at the
“[latest](https://babeljs.io/docs/plugins/preset-latest/)” preset to include
ES2015–17, as well as the
“[next/babel](https://github.com/zeit/next.js/blob/master/server/build/babel/preset.js)”
preset.

Please make full use of:

- [Object rest spread](https://babeljs.io/docs/plugins/transform-object-rest-spread/): `{ foo: 1, ...bar }`
- [Async functions](https://babeljs.io/docs/plugins/transform-async-to-generator/): `async (promisedNum) => (3 + await promisedNum)`
- [Class properties](https://babeljs.io/docs/plugins/transform-class-properties/): `class MyComponent { onClick = () => { this.setState({ clicked: true })} }`

Code style is enforced by ESLint, which can be run (in `--fix` mode) with
`npm run lint`. Committed code must contain no errors or warnings. On a per-file
basis, certain errors may be turned off. For example, to keep a class-based
component:

```
// eslint react/prefer-stateless-function: 0
```

### Backend

This project starts a [Hapi](https://hapijs.com/) server and uses Next.js’s
[custom server & routing](https://github.com/zeit/next.js#custom-server-and-routing)
support to serve HTML and JS. It runs the
[Apollo GraphQL server](https://github.com/apollographql/graphql-server) to
facilitate communication with the client code.

Server-only code, including the GraphQL schema and resolvers, is in the
`/server` directory.

**Backend debugging with Charles:**
`env NODE_TLS_REJECT_UNAUTHORIZED=0 http_proxy=http://localhost:8888/ npm run dev`

### Frontend

The Next.js framework turns components in the `/pages` directory into entry
points for the app. These are wrapped in higher-order components to provide
common setup for our store and Glamor CSS setup.

The MobX store is configured in the `/data/store` directory. Access to the
GraphQL backend is mediated through the function modules in `/data/dao`.

Components and containers are organized under `/components` by page.

For UI-focused development, use [React Storybook](https://getstorybook.io/) by
running `npm run storybook` and visiting <http://localhost:9001>

**Local use of patterns library:** After running `gulp` and `npx fractal start -- --watch` in the patterns directory, change `stylesheets.json` to
reference `https://localhost:3001` instead of `cob-patterns-staging`.

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [LICENSE](LICENSE.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.

## Contributions

If you're interested in helping this project, there are three ways to help. Be sure to checkout our [Guide to Contributing](https://github.com/CityOfBoston/boston.gov/blob/develop/guides/03-contributing-to-boston.gov.md).

- [Report issues on Boston.gov](https://github.com/CityOfBoston/boston.gov/blob/develop/guides/03-contributing-to-boston.gov.md#reporting-bugs)
- [Suggest new features](https://github.com/CityOfBoston/boston.gov/blob/develop/guides/03-contributing-to-boston.gov.md#suggest-new-features)
- [Contributing to development](https://github.com/CityOfBoston/boston.gov/blob/develop/guides/03-contributing-to-boston.gov.md#contributing-to-development)
