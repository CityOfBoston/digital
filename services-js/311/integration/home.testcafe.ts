import { Selector } from 'testcafe';

import { serverUrl, waitForReact, printConsoleLogs } from './testcafe-helpers';
import HomeDialogModel from './HomeDialogModel';
import QuestionsDialogModel from './QuestionsDialogModel';
import LocationDialogModel from './LocationDialogModel';
import ContactDialogModel from './ContactDialogModel';
import CasePageModel from './CasePageModel';

fixture('Home')
  .page(serverUrl('/'))
  .beforeEach(waitForReact)
  .afterEach(printConsoleLogs);

test('Search for case ID', async t => {
  const homeDialog = new HomeDialogModel();

  await t
    .typeText(homeDialog.searchField, '3000111')
    .click(homeDialog.searchButton)
    .expect(Selector('body').textContent)
    .contains('Submitted on September 6, 2018, 3:51 PM');
});

test('Search for a word', async t => {
  const homeDialog = new HomeDialogModel();

  await t
    .typeText(homeDialog.searchField, 'rats')
    .click(homeDialog.searchButton)
    .expect(Selector('body').textContent)
    .contains('Rat bite');
});

test('Request flow', async t => {
  const homeDialog = new HomeDialogModel();

  await t
    .typeText(homeDialog.descriptionBox, 'There’s some sort of birdemic!')
    .click(homeDialog.startRequestButton)
    .click(Selector('a').withText('Bird infestation'));

  const questionsDialog = new QuestionsDialogModel();
  const otherOption = questionsDialog.root.find(
    'label[for=SR-BIRDINFEST2-Other]'
  );
  const otherTextBox = questionsDialog.root.find('input[name=ST-OTHER]');

  await t
    .expect(questionsDialog.serviceNameHeader.textContent)
    .contains('Bird infestation')
    .expect(otherTextBox.exists)
    .notOk();

  // offset is because this can get hidden by the "feedback" fixed banner
  await t
    .click(otherOption, { offsetX: 0, offsetY: 0 })
    .typeText(otherTextBox, 'Solar panels')
    .click(questionsDialog.nextButton);

  const locationDialog = new LocationDialogModel();

  await t.expect(locationDialog.addressSearchField.exists).ok();

  await t
    .typeText(locationDialog.addressSearchField, '50 milk st')
    .click(locationDialog.addressSearchButton)
    .click(locationDialog.root.find('.addr').withText('50 MILK ST'))
    .click(locationDialog.unitMenu)
    .click(locationDialog.unitMenuOptions.withText('121 Devonshire St'))
    .click(locationDialog.nextButton);

  const contactDialog = new ContactDialogModel();
  await t
    .typeText(contactDialog.firstNameField, 'Rod')
    .typeText(contactDialog.lastNameField, 'Unknown')
    .typeText(contactDialog.emailField, 'rod@masssolarpanels.info')
    .click(contactDialog.submitButton);

  const casePage = new CasePageModel();
  await t
    .expect(Selector('body').textContent)
    .contains('Thank you for submitting.')
    .expect(casePage.serviceNameTitle.textContent)
    .eql('Bird infestation')
    .expect(Selector('body').textContent)
    .contains('121 Devonshire St');
});
