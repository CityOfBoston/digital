import { Selector } from 'testcafe';

import { serverUrl, waitForReact, printConsoleLogs } from './testcafe-helpers';
import CaseModel from './CasePageModel';

fixture('Search')
  .page(serverUrl('/search'))
  .beforeEach(waitForReact)
  .afterEach(printConsoleLogs);

test('Click on search result', async t => {
  const bulkItemPickupRow = Selector('a[data-request-id="200012225"]');

  await t
    .expect(bulkItemPickupRow.getStyleProperty('background-color'))
    .eql('rgba(0, 0, 0, 0)');

  // Test that when we click on the marker it highlights the row
  await t
    .click('div.leaflet-marker-icon:last-child')
    .expect(bulkItemPickupRow.getStyleProperty('background-color'))
    .eql('rgb(224, 224, 224)');

  await t.click(bulkItemPickupRow);

  const caseModel = new CaseModel();

  await t
    .expect(caseModel.serviceNameTitle.textContent)
    .eql('Trash or recycling not collected');
});

test('Search text field', async t => {
  const searchInput = Selector('div[role="main"] input[name="q"]').nth(1);

  await t
    .typeText(searchInput, 'assorted rubble')
    .expect(Selector('.t--intro').withText('No results found').exists)
    .ok();

  await t
    .typeText(searchInput, 'rats', { replace: true })
    .expect(Selector('a').withText('Rat bite').exists)
    .ok();

  await t.click(Selector('button').withText('CLEAR SEARCH'));
  await t.expect(Selector('a').withText('Needle pickup').exists).ok();
});
