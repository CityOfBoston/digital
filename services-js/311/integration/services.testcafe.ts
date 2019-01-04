import { Selector } from 'testcafe';

import { serverUrl, waitForReact, printConsoleLogs } from './testcafe-helpers';

fixture('Services')
  .page(serverUrl('/services'))
  .beforeEach(waitForReact)
  .afterEach(printConsoleLogs);

test('Expand category, go to service', async t => {
  await t
    .click(Selector('button').withText('Trash, recycling, and graffiti'))
    .click(Selector('a').withText('BULK ITEM PICKUP REQUEST'));

  // Tests that we go to the service’s page.
  await t
    .expect(Selector('h1').withText('BULK ITEM PICKUP REQUEST').exists)
    .ok()
    .expect(Selector('label').withText('DESCRIBE YOUR REQUEST').exists)
    .ok();
});
