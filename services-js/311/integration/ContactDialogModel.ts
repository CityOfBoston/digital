import { Selector, t } from 'testcafe';

export default class ContactDialogModel {
  public readonly root = Selector('.js-form-dialog');

  public readonly firstNameField = this.root.find('input[name=firstName]');
  public readonly lastNameField = this.root.find('input[name=lastName]');
  public readonly emailField = this.root.find('input[name=email]');
  public readonly phoneField = this.root.find('input[name=phone]');

  public readonly submitButton = this.root
    .find('button')
    .withText('SUBMIT REQUEST');
}
