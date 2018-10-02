import { Selector } from 'testcafe';
import PageModel from './PageModel';

/**
 * Page model for registering an MFA device.
 */
export default class DeviceRegistrationPageModel extends PageModel {
  form = Selector('.mn form');

  phoneRadioButton = this.form.find('input[value=phone]');
  smsRadioButton = this.form.find('input[value=sms]');
  voiceRadioButton = this.form.find('input[value=voice]');
  phoneNumberField = this.form.find('input[name=phoneNumber]');

  emailRadioButton = this.form.find('input[value=email]');
  emailField = this.form.find('input[name=email]');

  submitButton = this.form.find('button[type=submit]');

  modal = Selector('.md');
  codeField = this.modal.find('input[name=code]');
  codeSubmitButton = this.modal.find('button');

  submitVerificationCode = (t: TestController, code: string) =>
    t.typeText(this.codeField, code).click(this.codeSubmitButton);
}
