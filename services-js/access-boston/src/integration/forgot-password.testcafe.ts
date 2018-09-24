import { Selector } from 'testcafe';

import LoginFormModel from './LoginFormModel';
import PasswordPageModel from './PasswordPageModel';
import { fixtureUrl } from './testcafe-helpers';
import PageModel from './PageModel';

fixture('Forgot password').page(fixtureUrl('/forgot'));

test('Login does not apply to regular site', async t => {
  const loginPage = new LoginFormModel();
  await loginPage.logIn(t, 'CON02141');

  const page = new PageModel();
  await t.expect(page.sectionHeader.innerText).contains('FORGOT PASSWORD');

  // Even though we logged in through the "forgot" flow, we won't be logged in
  // in the main app so going to the homepage should put us on the other login
  // form.
  await t.navigateTo('/');

  // Match here is that this posts to "/assert", which is the login flow's SAML
  // endpoint. The forgot password flow’s SAML endpoint is /assert-forgot
  //
  // This is our check to see that we're on the "normal" login page, which
  // indicates that the forgot password session wasn't valid for the page we
  // navigated to.
  await t.expect(Selector('form').getAttribute('action')).match(/\/assert$/);
});

test('Reset password', async t => {
  const loginPage = new LoginFormModel();
  await loginPage.logIn(t, 'CON02141');

  const passwordPage = new PasswordPageModel();
  await t
    .typeText(passwordPage.newPasswordField, 'newPassword2018', {
      replace: true,
    })
    .typeText(passwordPage.confirmPasswordField, 'newPassword2018', {
      replace: true,
    })
    .click(passwordPage.submitButton);

  await t.expect(Selector('body').innerText).contains('RESET SUCCESSFUL!');
});

// If we don't automatically test this no one will remember that it exists and
// it will break.
test('Reset password (no JS)', async t => {
  const loginPage = new LoginFormModel();
  await loginPage.logIn(t, 'CON02141');

  await t.navigateTo('/forgot?noJs=true');

  const passwordPage = new PasswordPageModel();

  // We can test the "confirm" error case because it's not checked client-side
  // w/o JavaScript.
  await t
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

  await t
    .typeText(passwordPage.newPasswordField, 'newPassword2018', {
      replace: true,
    })
    .typeText(passwordPage.confirmPasswordField, 'newPassword2018', {
      replace: true,
    })
    .click(passwordPage.submitButton);

  await t.expect(Selector('body').innerText).contains('RESET SUCCESSFUL!');
});
