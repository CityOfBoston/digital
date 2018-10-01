import { Selector } from 'testcafe';

import LoginFormModel from './models/LoginFormModel';
import {
  fixtureUrl,
  makeGraphQlLogger,
  requestBodyPredicate,
  isReactRunning,
} from './testcafe-helpers';
import DeviceRegistrationPageModel from './models/DeviceRegistrationPageModel';

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
      .ok();
  });

test('Device registration', async t => {
  const mfaPage = new DeviceRegistrationPageModel();

  await t
    .click(mfaPage.emailRadioButton)
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
    .click(Selector('a').withText('Resend the code'))
    .expect(
      graphqlLogger.contains(requestBodyPredicate('mutation AddMfaDevice'))
    )
    .ok('Resend link makes a second server call');

  await t
    .click(Selector('a').withText('try a different number or email'))
    .typeText(mfaPage.phoneNumberField, '617 555-1212')
    .click(mfaPage.voiceRadioButton)
    .click(mfaPage.submitButton)
    .expect(mfaPage.modal.innerText)
    .contains('Please pick up!', 'Can switch to voice code');

  // TODO(finh): Continue this when more of the flow is implemented.
  await t
    .typeText(mfaPage.codeField, '999999')
    .click(mfaPage.codeSubmitButton)
    .expect(Selector('body').innerText)
    .contains('WELCOME TO ACCESS BOSTON');
});
