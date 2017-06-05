// @flow
/* global window */
/* eslint no-underscore-dangle: 0 */

import { observable, useStrict, action } from 'mobx';
import Router from 'next/router';

import type { LoopbackGraphql } from '../dao/loopback-graphql';

import Accessibility from './Accessibility';
import RequestSearch from './RequestSearch';
import MapLocation from './MapLocation';
import Ui from './Ui';
import BrowserLocation from './BrowserLocation';
import AllServices from './AllServices';
import RouterListener from './RouterListener';

// MobX will enforce that state changes only happen in action blocks.
useStrict(true);

export type LanguagePreference = {|
  code: string,
  region: ?string,
  quality: number,
|};

export class AppStore {
  // Initialization data from the server
  apiKeys: {[service: string]: any} = {};

  accessibility: Accessibility = new Accessibility();
  requestSearch: RequestSearch = new RequestSearch();
  ui: Ui = new Ui();
  browserLocation: BrowserLocation = new BrowserLocation();
  mapLocation: MapLocation = new MapLocation();
  allServices: AllServices = new AllServices();

  languages: LanguagePreference[] = [];

  @observable liveAgentAvailable: boolean = (typeof window !== 'undefined' && window.LIVE_AGENT_AVAILABLE) || false;

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
}

let browserStore: AppStore;

/**
 * Returns a Redux store for this application. For the server, always returns a
 * fresh store with the given initialState. On the browser, will always return
 * the same store and initialState is ignored after the first call.
 */
export default function getStore(loopbackGraphql: ?LoopbackGraphql): AppStore {
  if (process.browser && browserStore) {
    return browserStore;
  }

  const store = new AppStore();

  if (process.browser) {
    browserStore = store;
    store.accessibility.attach();
    store.ui.attach();
    store.browserLocation.attach(loopbackGraphql);

    new RouterListener().attach(Router, store, window.ga);
  }

  return store;
}
