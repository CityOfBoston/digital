# Digital Team

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Public documentation and [wiki](https://github.com/CityOfBoston/digital/wiki) for DoIT’s Digital team

## Monorepo Installation

```
$ yarn install
```

## Development

### Organization

This repo is split into two broad categories: services and modules. Modules are
JavaScript (and TypeScript) libraries that are shared across various apps.
Services are individual apps.

Modules may depend upon each other (though not circularly). Services may only
depend on modules. Nothing may depend on a service.

The majority of our services are written in JavaScript/TypeScript and are
therefore in the `services-js` directory. We have a few legacy Ruby apps in
`services-ruby`. These are stand-alone, without any dependencies on our own
libraries. Because we’re not doing new development in Ruby, we didn’t put the
effort into code-sharing infrastructure for it.

### Compliation / Transpilation

#### Modules

This uses “watch” features to rebuild all of our modules as their source
changes.

```
$ cd modules-js/react-fleet
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

You also may want to run `yarn watch-dependencies` to recompile changes in any
modules that the service depends upon.

### Making a new JavaScript module

```
$ npx khaos create -d templates <template-name> <destination>
$ yarn install
```

#### Current templates

 * **js-server-module:** Module for libraries that are only going to be required
   by server-side Node apps. Uses TypeScript for all compilation.
 * **js-browser-module:** Module that’s optimized for libraries that are
   included via Webpack. Uses TypeScript for type checking but compiles with the
   browser.js Babel configuration.

### Making a new JavaScript service

It’s best to copy from an existing one. See the [New service setup
documentation](https://docs.boston.gov/digital/guides/amazon-web-services/new-service-setup).

### Making a new Ruby service

Please don’t. We have a few Ruby services that pre-date this repo, but want to
focus future development entirely on JavaScript and Node.

## Releasing

### Staging

Staging instances are created by adding them into the Terraform templates.
Typically, each service will have a default staging deploy and may have other
“variants” for special circumstances.

Staging branch names follow the pattern:
 * `staging/<service-name>`
 * `staging/<service-name>@<variant>`

Where “`<service-name>`” is the service package’s name (minus any `services-js.`
prefix).

To deploy to staging, first force-push to the staging branch. A GitHub webhook
will fire and you’ll get a prompt in the `#digital_builds` Slack channel from
Shippy-Toe, asking you if you want to deploy. Press the “Deploy” button to
trigger the deployment, which is done via CloudBuild.

Tests are not run for the staging deploy so that you can put something on
staging even if the tests don’t pass. (Tip: use the `--no-verify` flag to `git
push` to keep it from trying to run the tests locally either.)

If you need to roll back a staging release, force-push an earlier commit and
re-deploy.

#### Example:

Deploying the Commissions App service to staging:

```
$ git co my-feature-branch
$ git push --force --no-verify origin HEAD:staging/commissions-app
```

Now press “Deploy” in `#digital_builds`.

Check on the status of the deploy by following the link in Shippy-Toe’s Slack
message to the CodeBuild run.

When the deploy completes, the new app will be available at:
[https://commissions-app.digital-staging.boston.gov/commissions](https://commissions-app.digital-staging.boston.gov/commissions)

### Production

We believe in continuous deployment, so anything that’s merged in to the
`develop` branch is eligible for immediate deployment.

At the end of the `develop` Travis run, the script “deploys” by running
deploy-tools’s `report-updated-services` tool. This uses Lerna to compare the
`develop` branch with all of the `production/*` branches for our services. If
develop contains any changes for a service—or one of its dependencies—that do
not exist in that service’s `production/<service-name>` branch, it notifies the
Shippy-Toe bot that a deploy is needed.

Just as with staging changes, Shippy-Toe will prompt in `#digital_builds` that
there are services to deploy. Press the “Deploy” button to release them.

**Note:** If the `internal-slack-bot` service comes up as deployable, wait to
deploy it last, since deploying it will wipe out the state of any running
deployments. They’ll still complete, but you won’t get notification of their
status.

Shippy-Toe will run the deployment by first pointing the
`production/<service-name>` branch to `develop`, then run the CodeBuild deploy
to release it.

If you need to roll back a production deploy, it’s cleanest to push a revert
commit through Travis and re-deploy. You can alternately force-push to the
appropriate `production/<service-name>` branch and run the CodeBuild deploy
manually. However, as long as the `production/*` branch lags behind `develop`,
Shippy-Toe will offer to deploy with every change that’s merged in.

## Dev Notes

### Testing

#### Jest

Most of our modules and services have tests written in Jest. Services that use
Storybook also use
[Storyshots](https://storybook.js.org/docs/testing/structural-testing/) to
integrate stories with Jest’s snapshot testing.

#### TestCafé

Some of our services also have
[TestCafé](https://devexpress.github.io/testcafe/) tests to do frontend/backend
integration tests. We use these typically for “critical path” tests (like going
through the Access Boston registration flow), especially those that are a pain
to manually test.

These tests get run on a headless browser via the `test` package.json scripts.
When developing, you can run `yarn testcafe:dev` to run TestCafé in your desktop
browser (or even a browser on another machine, like the BrowserStack cloud).

### TypeScript and Babel and Webpack and modules

We want to write the bulk of our code in TypeScript because type checking is
good. Unfortunately the landscape of JavaScript modules, `require` vs. `import`,
and client-side bundlers (such as Webpack) tend to complicate things. The same
piece of code might be required server-side, used client-side by both Next’s
webpack config and Storybook’s, and run in a Jest test.

#### Server-side Libraries

These tend to be the simplest to compile. We don’t need to worry about polyfills
or bundle sizes.

This means that we can build directly with TypeScript, via `tsc` and
`tsc-watch`, and get both typechecking and compiling at the same time.

The build target for server-side code is Node 8. This means **ES2017 syntax and
language features can be native** (such as `async`/`await`), but the **modules
must be CommonJS**. This is all set in `config-typescript`’s
`default.tsconfig.json` config via `"target": "es2017"` and `"modules":
"commonjs"`.

Nevertheless, since we test with Jest and our Jest setup uses `babel-loader`,
these packages still need a `.babelrc` file. It should just use the
`@cityofboston/config-babel/node` and `@cityofboston/config-babel/typescript`
presets.

(Babel is fully capable of processing TypeScript files into JavaScript, but it
doesn’t do any typechecking on them. It just strips the type annotations away
and compiles the rest.)

#### Client-side Libraries

These are libraries of frontend code, typically React components. We want to use
Babel to build these libraries to take advantage of the frontend-specific Babel
plugins (such as `@babel/env`, `emotion`, _&c._) while still outputting
browser-compatible (ES5) code.

These packages should load the `@cityofboston/config-babel/browser` preset from
their `.babelrc` files, which uses `@babel/env`’s default to compile to ES5.
They will likely also use `@cityofboston/config-babel/typescript`.

Despite having ES5 code, we want to export these libraries using ES2015 modules
so that Webpack can better tree-shake and keep unused code out of our
application bundles so that they’re smaller to download. See: [Webpack 4 tree
shaking guide](https://webpack.js.org/guides/tree-shaking/)

We do this by using a special `esm` value for `BABEL_NODE` when doing builds,
which `@cityofboston/config-babel/browser` interprets to generate `esm` modules.
We point `package.json`’s `module` property at the entry point for these modules
(and set `sideEffects` to `false`).

However, we still need CommonJS files because these libraries won’t always be
included via Webpack. This can be due to being included from server-side Node
files or just used in a Jest test. 

For Jest/Node to be able to handle imports of these modules from other packages,
we still need a `main` entry that points at a CommonJS build. We use Rollup to
convert the ESM build into a single `.es5.js` file that Jest can see.

Since we still want `d.ts` files so that there’s proper type checking when
importing these packages, we run `tsc --emitDeclarationOnly` during build. This
also has the side effect of doing the type checking that Babel does not.

#### NextJS Apps

These apps get tricky because they have server that runs in Node, client code
that runs in the browser (and also on the server with SSR), and (optionally)
shared library code that runs in both.

NextJS handles all of the web client code via Babel and Webpack. We use a
`.babelrc` file to include Next and TypeScript presets. So far we have not had
to make any of our own accommodations for the server-side rendering code.

Next and Webpack also handle hot-reloading of the client code when it changes.

For the server, we use `tsc` and `tsc-watch` but with a special
`tsconfig.server.json` TypeScript configuration that is limited to the
server-specific source directories. This keeps the server from restarting when
we make client-only changes.

The default `tsconfig.json` still includes all the code so that tooling will see
and typecheck everything.

In all cases the code is written in TypeScript. Do not use Babel plugins that
enable syntax that `tsc` can’t understand. Since the client-side code is not
typechecked when it’s compiled by Babel, we run `tsc --noEmit` on everything as
a `pretest` script to do type checking.

_Note:_ We may soon switch to just using Babel for the server code as well and
avoiding `tsc` for these apps entirely (beyond typechecking). The latest version
of `babel-watch` finally supports Babel 7. Previously it did not, so we used
`tsc-watch` to automatically reload the TypeScript code.

### Browser support and polyfills

As of this writing, Digital webapps support IE11 and the latest versions of the
evergreen browsers. (See [Browsers we
support](https://docs.boston.gov/digital/getting-started/life-on-the-digital-team/untitled#browsers-we-support)
in the working agreement)

One exception to this is the public-notices app, which needs to run on the old
version of Chrome that the digital display has installed.

Because we are always forgetting about polyfills, we’ve configured the
`babel-env` plugin to `"usage"` mode for `useBuiltIns`. This causes it to
automatically pull in core-js polyfills for functions as we use them. Note that
it does _not_ polyfill functions and classes that our dependencies may need, nor
does it polyfill `fetch`.

We’ve added polyfills that our dependencies tend to need, as well as
isomorphic-fetch, to the `polyfills.js` file in `next-client-common`. The
`withPolyfill` mixin is used in `next.config.js` files to automatically include
these polyfills before any other code.

We build all of our interfaces to be responsive, down to 320px wide.


### Updates and Patches
- 2020.12.10: React-Fleet - Node-Fetch 1.6.9 > 2.6.1
  - Affected Apps
    - modules-js
      - react-fleat `| []`
    - services-js
      - 311 `| []`
      - 311-indexer `| []`
      - access-boston `| []`
      - group-mgmt `| []`
      - internal-slack-bot `| []`
      - payment-webhooks `| []`
      - permit-finder `| []`
      - public-notices `| []`
      - registry-certs `| [x] | Docker > node:8.14-alpine`



### Deploys

- 2020.11.10: Reworking how AWS gets around Docker Hub Rate limiting 
