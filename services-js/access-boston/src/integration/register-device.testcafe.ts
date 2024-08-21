import { Selector } from 'testcafe';

import LoginFormModel from './models/LoginFormModel';
import DeviceRegistrationPageModel from './models/DeviceRegistrationPageModel';
import PageModel from './models/PageModel';

import {
  fixtureUrl,
  makeGraphQlLogger,
  requestBodyPredicate,
  isReactRunning,
} from './testcafe-helpers';

const graphqlLogger: RequestLogger = makeGraphQlLogger();

// Starting at "/" will give us a redirect to "/register" once the frontend
// realizes that the user hasn’t been registered.
fixture('Device Registration')
  .requestHooks(graphqlLogger)
  .page(fixtureUrl('/'))
  .beforeEach(async t => {
    const loginPage = new LoginFormModel();
    // "NEW" makes the fake give us a user that needs to go through registation.
    // Otherwise the mfa page might redirect us away.
    await loginPage.logIn(t, 'NEW02141');
    await t
      .navigateTo('/mfa')
      .expect(isReactRunning())
      .ok({ timeout: 30000 });
  });

test.only('Device registration', async t => {
  const mfaPage = new DeviceRegistrationPageModel();

  await t
    .click(mfaPage.emailLink)
    .typeText(mfaPage.emailField, 'test@boston.gov')
    .pressKey('tab')
    .expect(mfaPage.form.innerText)
    .contains(
      'Please use a personal email',
      'Email address validation appears on blur'
    );

  await t
    .typeText(mfaPage.emailField, 'test@example.com', { replace: true })
    .click(mfaPage.submitButton)
    .expect(
      graphqlLogger.contains(requestBodyPredicate('mutation AddMfaDevice'))
    )
    .ok('Submitting form makes server call');

  // Clears out the previous call so we can test the resend case.
  graphqlLogger.clear();

  await t
    .click(Selector('button').withText('Resend the code'))
    .expect(
      graphqlLogger.contains(requestBodyPredicate('mutation AddMfaDevice'))
    )
    .ok('Resend link makes a second server call');

  await t
    .click(Selector('button').withText('try a different number or email'))
    .click(mfaPage.phoneLink)
    .typeText(mfaPage.phoneNumberField, '617 555-1212')
    .click(mfaPage.voiceRadioButton)
    .click(mfaPage.submitButton)
    .expect(mfaPage.modal.innerText)
    .contains('Please pick up!', 'Can switch to voice code')
    .expect(mfaPage.modal.innerText)
    .contains('(xxx) xxx-xx12');

  await mfaPage
    .submitVerificationCode(t, '999999')
    .expect(
      mfaPage.modal.withText('That code didn’t seem right. Can you try again?')
        .exists
    )
    .ok('Error message from 999999 code appears');

  await mfaPage.submitVerificationCode(t, '123456');

  const donePage = new PageModel();
  await t
    .expect(donePage.sectionHeader.withText('YOU’RE ALL SET!').exists)
    .ok('On done page');

  // Now we go home to make sure that the session was destroyed. This should
  // redirect to login.
  await t.navigateTo('/');

  const loginPage = new LoginFormModel();
  await t.expect(loginPage.userIdField.exists).ok('On login page');
});
