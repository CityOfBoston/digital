import { Selector } from 'testcafe';
import PageModel from './PageModel';
import { isReactRunning } from '../testcafe-helpers';

export default class LoginFormModel extends PageModel {
  root = Selector('form');
  userIdField = this.root.find('input[name=userId]');
  submitButton = this.root.find('input[type=submit]');

  logIn(t: TestController, userId: string): Promise<TestController> {
    return (
      t
        .typeText(this.userIdField, userId, {
          replace: true,
        })
        .click(this.submitButton)
        // Make sure the app is going after we’ve submitted
        .expect(isReactRunning())
        .ok({ timeout: 30000 })
    );
  }
}
