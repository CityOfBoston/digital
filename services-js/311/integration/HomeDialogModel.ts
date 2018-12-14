import { Selector, t } from 'testcafe';

export default class HomeDialogModel {
  public readonly root = Selector('.js-form-dialog');

  public readonly descriptionBox = this.root.find('textarea');
  public readonly startRequestButton = this.root
    .find('button')
    .withText('START A REQUEST');

  public readonly searchField = this.root.find('input[name=q]');
  public readonly searchButton = this.searchField.sibling(
    'button[type=submit]'
  );
}
