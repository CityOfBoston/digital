# config-jest

Default Jest config to run TypeScript and output coverage.

To use this, add the folowing to your package.json file:

```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "@cityofboston/config-jest"
  },
  "devDependencies": {
    "@cityofboston/config-jest": "^0.0.0",
    "@types/jest": "^22.0.0",
    "jest": "^22.0.0",
    "ts-jest": "^22.0.0"
  }
}
```

The default behavior is to enable finding TypeScript tests and loading them with
`ts-jest`.

It also enables tcov and JSON test coverage. Adding `useStderr` prevents the
Jest test coverage reporter from adding a text summary at the end of output.
