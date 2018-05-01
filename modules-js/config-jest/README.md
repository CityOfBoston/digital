# config-jest

Default Jest config to run TypeScript and output coverage.

To use this, add the folowing to your package.json file:

```json
{
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
