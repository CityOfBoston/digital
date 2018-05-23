# config-jest-typescript

Jest preset for pure TypeScript projects. Loads files with `ts-jest-babel-7`.

To use this, add the folowing to your package.json file:

```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "@cityofboston/config-jest-typescript"
  },
  "devDependencies": {
    "@cityofboston/config-jest-typescript": "^0.0.0",
    "@types/jest": "^22.0.0",
    "jest": "^22.4.0"
  }
}
```

It also enables tcov and JSON test coverage. The `useStderr` option prevents the
Jest test coverage reporter from adding a text summary at the end of output.
