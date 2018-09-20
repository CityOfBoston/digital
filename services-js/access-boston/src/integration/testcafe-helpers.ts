const DEFAULT_SERVER_URL = 'http://localhost:3000';

export function fixtureUrl(path: string) {
  return `${process.env.TEST_SERVER_URL || DEFAULT_SERVER_URL}${path}`;
}
