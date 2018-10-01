import { Selector } from 'testcafe';
import PageModel from './PageModel';

export default class LoginFormModel extends PageModel {
  root = Selector('form');
  userIdField = this.root.find('input[name=userId]');
  submitButton = this.root.find('input[type=submit]');

  logIn(t: TestController, userId: string): Promise<TestController> {
    return t
      .typeText(this.userIdField, userId, {
        replace: true,
      })
      .click(this.submitButton);
  }
}
