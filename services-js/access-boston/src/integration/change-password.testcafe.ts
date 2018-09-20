import { Selector } from 'testcafe';

import LoginFormModel from './LoginFormModel';
import PasswordPageModel from './PasswordPageModel';
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
    .contains('Your current password is incorrect');

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

// If we don't automatically test this no one will remember that it exists and
// it will break.
test('Change password (no JS)', async t => {
  const loginPage = new LoginFormModel();
  await loginPage.logIn(t, 'CON02141');

  await t.navigateTo('/change-password?noJs=true');

  const passwordPage = new PasswordPageModel();

  // For no-JS case we can test the password confirm matching the new password,
  // since there's no way to test that client side.
  await t
    .typeText(passwordPage.currentPasswordField, 'correct-password', {
      replace: true,
    })
    .typeText(passwordPage.newPasswordField, 'newPassword2018', {
      replace: true,
    })
    .typeText(passwordPage.confirmPasswordField, 'differentPassword2018', {
      replace: true,
    })
    .click(passwordPage.submitButton);

  await t
    .expect(Selector('body').innerText)
    .contains('The password confirmation does not match your new password');

  // We re-type everything because it's a fresh form, and then see the success
  // case.
  await t
    .typeText(passwordPage.currentPasswordField, 'correct-password', {
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
    .contains('Your password has been changed!');
});
