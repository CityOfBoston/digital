# Digital Team

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Public documentation and [wiki](https://github.com/CityOfBoston/digital/wiki) for DoIT’s Digital team

## Monorepo Installation

```
$ yarn install
```

## Development

### Compliation / Transpilation

#### Modules

This uses “watch” features to rebuild all of our modules as their source
changes.

```
$ yarn watch
```

_Note:_ This may not necessarily capture recompiling depending modules when
their dependencies rebuild.

_Note:_ You may need to make heavy use of restarting any TypeScript server in
your editor if types in these modules change.


#### Services

```
$ cd services-js/commissions-app
$ yarn dev
```

### Making a new package

```
$ npx khaos create -d templates <template-name> <destination>
$ yarn install
```

#### Current templates

 * **js-module:** Server-side Node module. Uses TypeScript.


## Releasing

### Staging

Staging instances are created by adding them into the Terraform templates.
Typically, each service will have a default staging deploy and may have other
“variants” for special circumstances.

Staging branch names follow the pattern:
 * `staging/<service-name>`
 * `staging/<service-name>@<variant>`

Where “`<service-name>`” is the service package’s name.

To deploy to staging, force-push to the staging branch. A Travis job will pick
up the changes, update the staging container, and re-deploy the service in the
staging cluster.

Tests are not run for the staging deploy so that you can put something on
staging even if the tests don’t pass.

If you need to roll back a staging release, force-push an earlier commit.

#### Example:

Deploying the Commissions App service to staging:

```
$ git co my-feature-branch
$ git push --force origin HEAD:staging/commissions-app
```

Check on the status of the deploy on Travis by looking for a test run for the
`staging/commissions-app` branch:
[https://travis-ci.org/CityOfBoston/commissions/branches](https://travis-ci.org/CityOfBoston/commissions/branches)

When the deploy completes, the new app will be available at:
[https://commissions-app.digital-staging.boston.gov/commissions](https://commissions-app.digital-staging.boston.gov/commissions)

### Production

Each service has its own production branch. These are named
`production/<service-name>`, where “`<service-name>`” is the service package’s
name.

Deployments to production are done by opening a PR to merge `develop` into a
`production/…` branch. Have another engineer review it, then merge it. Travis
will run the tests and update the ECS service to create the deploy.

#### Example

To push the Commissions App to production, open a PR with
`production/commissions-app` as the base:
[https://github.com/CityOfBoston/commissions/compare/production/commissions-app...develop?expand=1](https://github.com/CityOfBoston/commissions/compare/production/commissions-app...develop?expand=1)

Create it and get it reviewed by another developer, then commit it.

You can follow along with the deploy by looking at the
`production/commissions-app` branch here on Travis:
[https://travis-ci.org/CityOfBoston/commissions/branches](https://travis-ci.org/CityOfBoston/commissions/branches)

Once it’s done, the new code will be running on [https://apps.boston.gov/commissions](https://apps.boston.gov/commissions)

## Dev Notes

### Testing

#### What’s with the `toBeDefined` junk tests?

A lot of modules have a single test that’s just if an exported function is
defined. These are modules that currently don’t have anything worth testing, or
can be usefully tested. Nevertheless, we include a test file to run in case
something gets added that _does_ demand testing.

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
code. Their `"main"` file should be a CommonJS bundle built with Rollup. There
should also be a `"module"` entry with ES2015 module syntax (`import`/`export`)
for better Webpack unused code removal.

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

We exclude the client-specific code with `tsconfig.server.json` so that changes
to it won’t cause `tsc-watch` to reload the app. (NextJS handles hot-reloading
client code.) The default `tsconfig.json` still includes all the code so that
tooling will see and typecheck everything.

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
