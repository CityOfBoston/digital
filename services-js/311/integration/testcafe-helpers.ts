import { ClientFunction } from 'testcafe';

const DEFAULT_SERVER_URL = 'http://localhost:3000';

export function serverUrl(path: string) {
  return `${process.env.TEST_SERVER_URL || DEFAULT_SERVER_URL}${path}`;
}

// APP_RUNNING is set in _app.tsx’s componentDidMount. It's useful to wait on to
// make sure we don’t interact with forms and other things before the JS has
// started running, otherwise our values will get stomped by the client-side
// render.
export const isReactRunning = ClientFunction(
  () => !!(window as any).APP_RUNNING
);

export async function waitForReact(t: TestController) {
  await t.expect(isReactRunning()).ok({ timeout: 30000 });
}

export async function printConsoleLogs(t: TestController) {
  const { log } = await t.getBrowserConsoleMessages();
  log.forEach(msg => {
    // eslint-disable-next-line no-console
    console.log(msg);
  });
}
