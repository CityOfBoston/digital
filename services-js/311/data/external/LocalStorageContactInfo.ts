import { runInAction, observable, computed, autorun } from 'mobx';
import RequestForm from '../store/RequestForm';

export default class LocalStorageContactInfo {
  @observable rememberInfo: boolean = false;

  rememberInfoDisposer: Function | null = null;

  constructor(requestForm: RequestForm) {
    if (this.canRememberInfo) {
      runInAction('LocalStorageContactInfo constructor', () => {
        this.rememberInfo =
          localStorage.getItem('ContactInfo.firstName') != null;
        requestForm.firstName =
          localStorage.getItem('ContactInfo.firstName') || '';
        requestForm.lastName =
          localStorage.getItem('ContactInfo.lastName') || '';
        requestForm.email = localStorage.getItem('ContactInfo.email') || '';
        requestForm.phone = localStorage.getItem('ContactInfo.phone') || '';
      });

      this.rememberInfoDisposer = autorun(
        () => {
          if (this.rememberInfo) {
            localStorage.setItem(
              'ContactInfo.firstName',
              requestForm.firstName
            );
            localStorage.setItem('ContactInfo.lastName', requestForm.lastName);
            localStorage.setItem('ContactInfo.email', requestForm.email);
            localStorage.setItem('ContactInfo.phone', requestForm.phone);
          } else {
            localStorage.removeItem('ContactInfo.firstName');
            localStorage.removeItem('ContactInfo.lastName');
            localStorage.removeItem('ContactInfo.email');
            localStorage.removeItem('ContactInfo.phone');
          }
        },
        { name: 'remember contact info', delay: 250 }
      );
    }
  }

  dispose() {
    if (this.rememberInfoDisposer) {
      this.rememberInfoDisposer();
    }
  }

  @computed
  get canRememberInfo(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
