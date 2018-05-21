# Boards and Commissions

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## Installation

```
$ yarn install
```

## Development

```
$ cd services-js/commissions-app
$ npm run dev
```

### Making a new package

```
$ npx khaos create -d templates <template-name> <destination>
$ yarn install
```

#### Current templates

 * **js-module:** Server-side Node module. Uses TypeScript.

## Dev Notes

### TypeScript and Babel and Webpack and modules

#### Server-side Libraries

For server-side code, we use TypeScript directly. That means that the build
steps are handled by `tsc` and development uses `tsc-watch`. Projects’
`tsconfig.json` will typically reference the `default.tsconfig.json` file from
the `@cityofboston/config-typescript` package.

The target for server-side code is Node 8. This means **ES2017 syntax and
language features can be native** (such as `async`/`await`), but the **modules
must be CommonJS**. This is all set in `default.tsconfig.json` config via
`"target": "es2017"` and `"modules": "commonjs"`.

For server-side testing with Jest, use the
`@cityofboston/config-jest-typescript` preset, which uses `ts-jest` to load
TypeScript files.

#### Client-side Libraries

These are libraries of React components. We want to use Babel to build these
libraries to take advantage of the frontend-specific Babel plugins (such as
`@babel/env`, `emotion`, _&c._). They should output browser-compatible (ES5)
code, but with ES2015 modules for Webpack, referenced by the `"module"`
value in their `package.json` files.

These packages should load the `@cityofboston/config-babel/react` preset from
their `.babelrc` files, which uses `@babel/env` to generate browser-compatible
code.

For client-side testing with Jest, use the `@cityofboston/config-jest-babel`
preset. This uses `babel-jest` to load the test files (rather than `ts-jest`),
in order to be consistent with compilation.

These libraries are written in TypeScript, but _compiled_ with Babel. The
`@babel/plugin-transform-typescript` plugin does not do any TypeScript
compilation, but instead transforms and strips TypeScript–specific syntax so
that Babel can compile it as if it were just ESNext code. This means that
`tsconfig.json` is completely ignored for transforming the source into ES5,
but is still necessary for type checking and to generate the type definitions.

Using ES2015 `import`/`export` statements is important for getting unused code
removal from Webpack. We don’t want unused components from these packages
getting bundled with our apps! These packages must also specify a `sideEffects`
value in `package.json` for the benefit of Webpack 4. See: [Webpack 4 tree
shaking guide](https://webpack.js.org/guides/tree-shaking/)

_Note:_ Next 6 currently uses Webpack 3, but `import`/`export` + Uglify’s unused
code elimination still works pretty well.

#### NextJS Apps

These apps get tricky because they have server that runs in Node, client code
that runs in the browser (and also on the server with SSR), and some library
code that can run in both. NextJS will use Babel (and Webpack) for the client
code, and we use `tsc` (and `tsc-watch`) for the server.

We exclude the client-specific code with `tsconfig.json` so that changes to it
won’t cause `tsc-watch` to reload the app. (NextJS handles hot-reloading client
code.) We have a `tsconfig.check.json` file that does include that code for
doing typechecking.

In all cases the code is written in TypeScript. Do not use Babel to add syntax
that `tsc` can’t understand. We run `tsc --noEmit` on everything as a `pretest`
script to make sure that the client code typechecks. (Normally `tsc` will only
run on the server and shared code as part of either `dev` or `build` scripts.)

For testing with Jest, use `@cityofboston/config-jest-babel` (`babel-jest`) for
everything, rather than try to compile server-side pieces with `ts-jest`. This
is because our client-side code will need Babel for any tranforms it uses
(such as JSX). It does mean that the server code will get compiled with Babel
for test, but TypeScript for production, but that should not materially
affect our testing. (The danger is things like Babel’s `async` polyfill acting
differently from the native Node 8 implementation.)

_Note:_ We could switch to just using Babel for the server code as well and
avoiding `tsc` for these apps entirely (beyond typechecking). Unfortunately, as
of this writing the latest version of `babel-watch` (2.0.7) does not support
Babel 7. We use `tsc-watch` to automatically reload the TypeScript code. Hacking
together something with `babel --watch` and `nodemon` would be possible,
however.
