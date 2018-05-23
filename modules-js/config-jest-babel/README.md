# config-jest-babel

Jest preset for projects that use Babel in their build process. Uses
`babel-jest` to load all files, including `.tsx?` files. It’s expected that the
`.babelrc` for the project is configured to process TypeScript.

To use this, add the folowing to your package.json file:

```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "@cityofboston/config-jest-babel"
  },
  "devDependencies": {
    "@cityofboston/config-jest-babel": "^0.0.0",
    "@types/jest": "^22.0.0",
    "jest": "^22.4.0"
  }
}
```

It also enables tcov and JSON test coverage. The `useStderr` option prevents the
Jest test coverage reporter from adding a text summary at the end of output.
