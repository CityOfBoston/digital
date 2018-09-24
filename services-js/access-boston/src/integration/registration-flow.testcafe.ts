import { Selector } from 'testcafe';

import LoginFormModel from './LoginFormModel';
import PasswordPageModel from './PasswordPageModel';
import { fixtureUrl } from './testcafe-helpers';
import PageModel from './PageModel';

// Starting at "/" will give us a redirect to "/register" once the frontend
// realizes that the user hasn’t been registered.
fixture('New User Registration').page(fixtureUrl('/'));

test('Registration with new password and MFA', async t => {
  const loginPage = new LoginFormModel();
  // "NEW" makes the fake give us a user that needs to go through registation.
  await loginPage.logIn(t, 'NEW02141');

  const registerPage = new PageModel();
  await t
    .expect(registerPage.sectionHeader.innerText)
    .contains('WELCOME TO ACCESS BOSTON!');

  await t.click(Selector('.btn').withText('SET PASSWORD'));

  const passwordPage = new PasswordPageModel();
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

  // TODO(finh): Implement MFA device registration
  await t
    .expect(Selector('body').innerText)
    .contains('This page could not be found');
});
