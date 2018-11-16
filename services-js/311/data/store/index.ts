/* global window */

import { observable, configure as mobxConfigure, action } from 'mobx';
import Router from 'next/router';

import RequestSearch from './RequestSearch';
import AddressSearch from './AddressSearch';
import Ui from './Ui';
import BrowserLocation from './BrowserLocation';
import AllServices from './AllServices';
import {
  FetchGraphql,
  ScreenReaderSupport,
  GaSiteAnalytics,
  RouterListener,
} from '@cityofboston/next-client-common';
import { SiteAnalytics } from '@cityofboston/next-client-common/build/SiteAnalytics';

// MobX will enforce that state changes only happen in action blocks.
mobxConfigure({ enforceActions: true });

export type LanguagePreference = {
  code: string;
  region: string | null;
  quality: number;
};

export class AppStore {
  screenReaderSupport: ScreenReaderSupport = new ScreenReaderSupport();
  requestSearch: RequestSearch = new RequestSearch();
  ui: Ui = new Ui();
  browserLocation: BrowserLocation = new BrowserLocation();
  addressSearch: AddressSearch = new AddressSearch();
  allServices: AllServices = new AllServices();
  siteAnalytics: SiteAnalytics = new GaSiteAnalytics();

  languages: LanguagePreference[] = [];

  @observable
  liveAgentAvailable: boolean = (typeof window !== 'undefined' &&
    window.LIVE_AGENT_AVAILABLE) ||
  false;

  _liveAgentButtonId: string = '';

  get liveAgentButtonId(): string {
    return this._liveAgentButtonId;
  }

  set liveAgentButtonId(liveAgentButtonId: string) {
    this._liveAgentButtonId = liveAgentButtonId;

    if (typeof window !== 'undefined') {
      if (window.liveagent) {
        this.listenForLiveAgentEvents(liveAgentButtonId);
      } else {
        if (!window._laq) {
          window._laq = [];
        }

        window._laq.push(() =>
          this.listenForLiveAgentEvents(liveAgentButtonId)
        );
      }
    }
  }

  listenForLiveAgentEvents(liveAgentButtonId: string) {
    window.liveagent!.addButtonEventHandler(
      liveAgentButtonId,
      this.liveAgentEventHandler
    );
  }

  @action.bound
  liveAgentEventHandler(event: string) {
    switch (event) {
      case 'BUTTON_AVAILABLE':
        this.liveAgentAvailable = true;
        break;
      case 'BUTTON_UNAVAILABLE':
        this.liveAgentAvailable = false;
        break;
      default:
        break;
    }
  }
}

let browserStore: AppStore;

/**
 * Returns a Redux store for this application. For the server, always returns a
 * fresh store with the given initialState. On the browser, will always return
 * the same store and initialState is ignored after the first call.
 */
export default function getStore(
  fetchGraphql: FetchGraphql | null = null
): AppStore {
  if (process.browser && browserStore) {
    return browserStore;
  }

  const store = new AppStore();

  if (process.browser) {
    browserStore = store;
    store.screenReaderSupport.attach();
    store.ui.attach();
    store.browserLocation.attach(fetchGraphql);

    new RouterListener().attach({
      router: Router,
      siteAnalytics: store.siteAnalytics,
      screenReaderSupport: store.screenReaderSupport,
    });
  }

  return store;
}
