import { autorun, observable, action } from 'mobx';
import CertifiedMail, { CertMailProps } from '../models/CertifiedMail';

export const LOCAL_STORAGE_CERTMAIL_KEY = 'certmail';
export const SESSION_STORAGE_CERTMAIL_KEY = 'certmail';

/**
 * Class to provide CertMail objects that are pre-populated from storage and can
 * write back to it.
 *
 * We use localStorage to save address information if the user explicitly opts
 * in to it.
 *
 * We use sessionStorage to keep the CertMail while the forms are being filled out.
 */

export default class CertMailProvider {
  @observable.ref private localStorage: Storage | null = null;
  @observable.ref private sessionStorage: Storage | null = null;

  private attached: boolean = false;
  private certMailResolveFns: Array<(CertifiedMail) => unknown> = [];

  @action
  attach(localStorage: Storage | null, sessionStorage: Storage | null) {
    this.localStorage = localStorage;
    this.sessionStorage = sessionStorage;
    this.attached = true;

    this.certMailResolveFns.forEach(fn => {
      fn(this.getCertMailInternal());
    });
  }

  @action
  detach() {
    this.localStorage = null;
    this.sessionStorage = null;
    this.attached = false;
  }

  /**
   * Returns a Promise that will resolve to an Order once we have attached.
   * Ensures that if there is localStorage / sessionStorage data to initialize
   * with then we’ve loaded it.
   */
  get(): Promise<CertifiedMail> {
    if (this.attached) {
      return Promise.resolve(this.getCertMailInternal());
    } else {
      return new Promise(resolve => {
        this.certMailResolveFns.push(resolve);
      });
    }
  }

  public getCertInfo() {
    if (sessionStorage) {
      try {
        return JSON.parse(
          sessionStorage.getItem(SESSION_STORAGE_CERTMAIL_KEY) || 'null'
        );
      } catch (e) {
        // safety value
        console.log(`Error (getCertInfo): `, e);
      }
    }
  }

  private getCertMailInternal(): CertifiedMail {
    const { localStorage, sessionStorage } = this;

    let mailInfo: CertMailProps | null = null;

    // Session storage is where the current cert-mail is saved.
    if (sessionStorage) {
      try {
        mailInfo = JSON.parse(
          sessionStorage.getItem(SESSION_STORAGE_CERTMAIL_KEY) || 'null'
        );
      } catch (e) {
        // safety value
        sessionStorage.removeItem(SESSION_STORAGE_CERTMAIL_KEY);
      }
    }

    if (!mailInfo && localStorage) {
      try {
        mailInfo = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_CERTMAIL_KEY) || 'null'
        );
      } catch (e) {
        // safety value
        localStorage.removeItem(LOCAL_STORAGE_CERTMAIL_KEY);
      }
    }

    const cert = new CertifiedMail(mailInfo, !!localStorage);

    autorun(
      () => {
        const { localStorage } = this;

        if (!localStorage) {
          return;
        }

        if (cert.certMailInfo.requestCertifiedMail) {
          const value = JSON.stringify(
            this.permanentStorageInfo(cert.certMailInfo)
          );
          localStorage.setItem(LOCAL_STORAGE_CERTMAIL_KEY, value);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_CERTMAIL_KEY);
        }
      },
      {
        name: 'CertMail: -> localStorage',
      }
    );

    autorun(
      () => {
        const { sessionStorage } = this;

        if (!sessionStorage) {
          return;
        }

        // Unlike localStorage, the sessionStorage values are unfiltered and
        // always saved.
        const value = JSON.stringify(cert.certMailInfo);
        sessionStorage.setItem(SESSION_STORAGE_CERTMAIL_KEY, value);
      },
      {
        name: 'Order -> sessionStorage',
      }
    );

    return cert;
  }

  /**
   * Removes the order from session storage. Call this after the order is
   * submitted successfully.
   */
  clear() {
    const { sessionStorage } = this;

    if (sessionStorage) {
      sessionStorage.removeItem(SESSION_STORAGE_CERTMAIL_KEY);
    }
  }

  /**
   * Returns a filtered OrderInfo based on the values of storeContactAndShipping
   * and storeBilling. If either is true, include its value, otherwise include an empty string
   * false.
   *
   * Does not return any card token information.
   */
  private permanentStorageInfo(certMailInfo: CertMailProps): CertMailProps {
    const { requestCertifiedMail } = certMailInfo;

    const outInfo: CertMailProps = {
      requestCertifiedMail: requestCertifiedMail ? requestCertifiedMail : false,
    };

    return outInfo;
  }
}
