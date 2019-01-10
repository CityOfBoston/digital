import { Selector } from 'testcafe';

import LoginFormModel from './models/LoginFormModel';
import PasswordPageModel from './models/PasswordPageModel';
import { fixtureUrl } from './testcafe-helpers';

fixture('Change password').page(fixtureUrl('/'));

test('Change password', async t => {
  const loginPage = new LoginFormModel();
  await loginPage.logIn(t, 'CON02141');

  await t.click(Selector('a').withText('Change Password'));

  const passwordPage = new PasswordPageModel();

  // First try is a "wrong password" to test the error case
  await t
    .typeText(passwordPage.currentPasswordField, 'wrong-password', {
      replace: true,
    })
    .typeText(passwordPage.newPasswordField, 'newPassword2018', {
      replace: true,
    })
    .typeText(passwordPage.confirmPasswordField, 'newPassword2018', {
      replace: true,
    })
    .click(passwordPage.submitButton);

  await t
    .expect(Selector('body').innerText)
    .contains('You have entered an invalid current password.');

  // Corrects the password to see success
  await t
    .typeText(passwordPage.currentPasswordField, 'correct-password', {
      replace: true,
    })
    .click(passwordPage.submitButton);

  await t
    .expect(Selector('body').innerText)
    .contains('Your password has been changed!');
});
