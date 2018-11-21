import { Selector } from 'testcafe';

import LoginFormModel from './models/LoginFormModel';
import PasswordPageModel from './models/PasswordPageModel';
import PageModel from './models/PageModel';
import DeviceRegistrationPageModel from './models/DeviceRegistrationPageModel';

import { fixtureUrl } from './testcafe-helpers';

// Starting at "/" will give us a redirect to "/register" once the frontend
// realizes that the user hasn’t been registered.
fixture('New User Registration').page(fixtureUrl('/'));

test('Registration with new password and MFA', async t => {
  const loginPage = new LoginFormModel();
  // "NEW" makes the fake give us a user that needs to go through registation.
  await loginPage.logIn(t, 'NEW02141');

  const registerPage = new PageModel();
  await t
    .expect(
      registerPage.sectionHeader.withText('WELCOME TO ACCESS BOSTON!').exists
    )
    .ok();

  await t.click(Selector('.btn').withText('GET STARTED'));

  const passwordPage = new PasswordPageModel();
  await t
    .typeText(passwordPage.currentPasswordField, 'correct-password')
    .typeText(passwordPage.newPasswordField, 'newPassword2018')
    .typeText(passwordPage.confirmPasswordField, 'newPassword2018')
    .click(passwordPage.submitButton);

  const mfaPage = new DeviceRegistrationPageModel();

  await t
    .typeText(mfaPage.phoneNumberField, '617 555-1212')
    .click(mfaPage.submitButton)
    .typeText(mfaPage.codeField, '555555')
    .click(mfaPage.codeSubmitButton);

  const donePage = new PageModel();
  await t
    .expect(donePage.sectionHeader.withText('YOU’RE ALL SET!').exists)
    .ok('On done page');
});

test('Registration with just new password', async t => {
  const loginPage = new LoginFormModel();
  // This is a special login that doesn't need an MFA device
  await loginPage.logIn(t, 'NEW88888');

  const registerPage = new PageModel();
  await t
    .expect(
      registerPage.sectionHeader.withText('WELCOME TO ACCESS BOSTON!').exists
    )
    .ok();

  await t.click(Selector('.btn').withText('GET STARTED'));

  const passwordPage = new PasswordPageModel();
  await t
    .typeText(passwordPage.currentPasswordField, 'correct-password')
    .typeText(passwordPage.newPasswordField, 'newPassword2018')
    .typeText(passwordPage.confirmPasswordField, 'newPassword2018')
    .click(passwordPage.submitButton);

  const donePage = new PageModel();
  await t
    .expect(donePage.sectionHeader.withText('YOU’RE ALL SET!').exists)
    .ok('On done page');
});
