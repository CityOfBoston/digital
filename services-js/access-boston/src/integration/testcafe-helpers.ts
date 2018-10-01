import { RequestLogger, ClientFunction } from 'testcafe';

const DEFAULT_SERVER_URL = 'http://localhost:3000';

export function fixtureUrl(path: string) {
  return `${process.env.TEST_SERVER_URL || DEFAULT_SERVER_URL}${path}`;
}

// This doesn't seem to be exported directly as a type from TestCafe.
export type TestCafeRequest = RequestLogger['requests'][0];

export function makeGraphQlLogger() {
  return RequestLogger(/\/graphql/, {
    logRequestBody: true,
    stringifyRequestBody: true,
  });
}

export function requestBodyPredicate(str: string) {
  return ({ request }: TestCafeRequest) =>
    (request.body as string).includes(str);
}

// APP_RUNNING is set in _app.tsx’s componentDidMount. It's useful to wait on to
// make sure we don’t interact with forms before the JS has started running,
// otherwise our values will get stomped by Formik’s initialValues.
export const isReactRunning = ClientFunction(
  () => !!(window as any).APP_RUNNING
);
