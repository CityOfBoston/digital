import { Selector } from 'testcafe';
import PageModel from './PageModel';

/**
 * Page model object that can work for both change password and forgot password
 * fields.
 */
export default class PasswordPageModel extends PageModel {
  form = Selector('.mn form');

  currentPasswordField = this.form.find('input[name=password]');
  newPasswordField = this.form.find('input[name=newPassword]');
  confirmPasswordField = this.form.find('input[name=confirmPassword]');

  submitButton = this.form.find('button[type=submit]');

  submit(t: TestController): Promise<TestController> {
    return t.click(this.submitButton);
  }
}
