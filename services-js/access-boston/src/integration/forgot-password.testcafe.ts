import { Selector } from 'testcafe';

import LoginFormModel from './models/LoginFormModel';
import PasswordPageModel from './models/PasswordPageModel';
import { fixtureUrl } from './testcafe-helpers';
import PageModel from './models/PageModel';

fixture('Forgot password').page(fixtureUrl('/forgot'));

test('Login does not apply to regular site', async t => {
  const loginPage = new LoginFormModel();
  await loginPage.logIn(t, 'CON02141');

  const page = new PageModel();
  await t.expect(page.sectionHeader.withText('FORGOT PASSWORD').exists).ok();

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

  await t.expect(Selector('body').withText('RESET SUCCESSFUL').exists).ok();
});
