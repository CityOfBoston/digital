// @flow
/* global window */
/* eslint no-underscore-dangle: 0 */

import { observable, computed, useStrict, action } from 'mobx';

import type { Service, ServiceSummary } from '../types';

import RequestForm from './RequestForm';
import RequestSearch from './RequestSearch';
import Ui from './Ui';
import BrowserLocation from './BrowserLocation';

// MobX will enforce that state changes only happen in action blocks.
useStrict(true);

export class AppStore {
  @observable requestForm: RequestForm = new RequestForm();
  requestSearch: RequestSearch = new RequestSearch();
  ui: Ui = new Ui();
  browserLocation: BrowserLocation = new BrowserLocation();

  @observable.shallow topServiceSummaries: ServiceSummary[];
  serviceCache: Map<string, Service> = observable.shallowMap({});

  @observable liveAgentAvailable: boolean = (typeof window !== 'undefined' && window.LIVE_AGENT_AVAILABLE) || false;

  // Initialization data from the server
  apiKeys: {[service: string]: any} = {};

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

        window._laq.push(() => this.listenForLiveAgentEvents(liveAgentButtonId));
      }
    }
  }

  listenForLiveAgentEvents(liveAgentButtonId: string) {
    window.liveagent.addButtonEventHandler(liveAgentButtonId, this.liveAgentEventHandler);
  }

  @action.bound
  liveAgentEventHandler(event: string) {
    switch (event) {
      case 'BUTTON_AVAILABLE': this.liveAgentAvailable = true; break;
      case 'BUTTON_UNAVAILABLE': this.liveAgentAvailable = false; break;
      default: break;
    }
  }

  @observable.ref _currentService: ?Service = null;
  @observable.ref currentServiceError: ?Object = null;

  @computed get currentService(): ?Service {
    return this._currentService;
  }

  set currentService(service: ?Service) {
    if (service === this._currentService) {
      return;
    }

    this._currentService = service;
    this.currentServiceError = null;

    try {
      this.requestForm.updateForService(service);
    } catch (e) {
      this.currentServiceError = e;
    }
  }

  @action
  // Call after a succesful submit to clear the form
  resetRequest() {
    this.requestForm = new RequestForm();
  }
}

let browserStore: AppStore;

/**
 * Returns a Redux store for this application. For the server, always returns a
 * fresh store with the given initialState. On the browser, will always return
 * the same store and initialState is ignored after the first call.
 */
export default function getStore(): AppStore {
  if (process.browser && browserStore) {
    return browserStore;
  }

  const store = new AppStore();

  if (process.browser) {
    browserStore = store;
    store.ui.attach();
    store.browserLocation.attach();
  }

  return store;
}
