import { Selector } from 'testcafe';
import PageModel from './PageModel';

/**
 * Page model for registering an MFA device.
 */
export default class DeviceRegistrationPageModel extends PageModel {
  form = Selector('.mn form');

  phoneLink = this.form.find('a').withText('get codes via phone call or text');
  smsRadioButton = this.form.find('input[value=sms]');
  voiceRadioButton = this.form.find('input[value=voice]');
  phoneNumberField = this.form.find('input[name=phoneNumber]');

  emailLink = this.form.find('a').withText('Get codes via personal email');
  emailField = this.form.find('input[name=email]');

  submitButton = this.form.find('button[type=submit]');

  modal = Selector('.md');
  codeField = this.modal.find('input[name=code]');
  codeSubmitButton = this.modal.find('button');

  submitVerificationCode = (t: TestController, code: string) =>
    t.typeText(this.codeField, code).click(this.codeSubmitButton);
}
