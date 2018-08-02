# config-typescript

This module defines TypeScript configuration files that can be used in other
packages so that we have a default set of TypeScript configurations.

It’s defined as a package, rather than at the top level of the repo, so that
changes to it are tracked by Lerna and will cause a recompile and retest of all
our TypeScript packages.

Because the paths in these files are resolved relative to the
`config-typescript` package, you still need to define your own paths within your
package.

To get started with TypeScript, add the following to your `package.json`:

```json
{
  "scripts": {
    "prebuild": "rimraf build",
    "build": "tsc",
    "dev": "npm run prebuild && tsc-watch --onSuccess \"npm run start\"",
    "prepare": "npm run build",
  },
  "devDependencies": {
    "@cityofboston/config-typescript": "^0.0.0",
    "rimraf": "^2.6.2",
    "tsc-watch": "^1.0.26",
    "typescript": "^2.8.1"
  }
}
```

Then, create the following `tsconfig.json` file in your package:

```json
{
  "extends": "./node_modules/@cityofboston/config-typescript/tsconfig.default.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "build"
  },
  "include": [
    "src/**/*"
  ]
}
```

If you’re running a server, you may also want: `yarn add --dev @types/node`

This module is included in the workspace’s `nohoist` configuration so that it
can be referenced through
`./node_modules/@cityofboston/config-typescript/tsconfig.json` in modules’
`tsconfig.json` files.

