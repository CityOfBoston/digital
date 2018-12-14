import { Selector, t } from 'testcafe';

export default class LocationDialogModel {
  public readonly root = Selector('.js-form-dialog');

  public readonly addressSearchField = this.root.find(
    'input[aria-label="Address search field"]'
  );
  public readonly addressSearchButton = this.addressSearchField.sibling(
    'button[type=submit]'
  );

  public readonly unitMenu = this.root.find('#unit-menu');
  public readonly unitMenuOptions = this.unitMenu.find('option');

  public readonly nextButton = this.root.find('button').withText('NEXT');
}
