import decryptEnv from './srv-decrypt-env';

// Not really anything we can test without hitting AWS.

it('is defined', () => {
  expect(decryptEnv).toBeDefined();
});
