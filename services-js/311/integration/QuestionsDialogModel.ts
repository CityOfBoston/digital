import { Selector, t } from 'testcafe';

export default class QuestionsDialogModel {
  public readonly root = Selector('.js-form-dialog');

  public readonly serviceNameHeader = this.root.find('h1');
  public readonly descriptionBox = this.root.find('textarea[name=description]');

  public readonly nextButton = this.root.find('button').withText('NEXT');
}
