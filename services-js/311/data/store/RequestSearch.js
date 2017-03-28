// @flow

import { observable, action, autorun } from 'mobx';
import type { SearchRequest, SearchRequestsPage } from '../types';
import searchRequests from '../dao/search-requests';
import type { LoopbackGraphql } from '../dao/loopback-graphql';

type LatLng = {
  lat: number,
  lng: number,
};

export default class RequestSearch {
  // Setting these properties will cause a search to happen
  @observable query: string = '';
  @observable mapCenter: ?LatLng = null;
  @observable radiusKm: number = 0;

  @observable.shallow results: SearchRequest[] = [];
  @observable.ref selectedRequest: ?SearchRequest = null;
  @observable selectedSource: ?string = null;

  searching: boolean = false;
  searchPending: boolean = false;
  searchDisposer: ?Function = null;

  @action.bound
  update({ requests }: SearchRequestsPage) {
    this.results = requests;
    this.selectedRequest = null;
  }

  // Starting / stopping currently done in ReportLayout
  start(loopbackGraphql: LoopbackGraphql) {
    this.searching = false;
    this.searchPending = false;
    this.searchDisposer = autorun(this.search.bind(this, loopbackGraphql));
  }

  stop() {
    if (this.searchDisposer) {
      this.searchDisposer();
    }
  }

  search(loopbackGraphql: LoopbackGraphql) {
    const { mapCenter, radiusKm, query } = this;

    if (!mapCenter || !radiusKm) {
      return;
    }

    if (this.searching) {
      this.searchPending = true;
      return;
    }

    this.searching = true;
    this.searchPending = false;

    const searchComplete = action(() => {
      this.searching = false;
      if (this.searchPending) {
        this.search(loopbackGraphql);
      }
    });

    searchRequests(loopbackGraphql, query, mapCenter, radiusKm).then(this.update).then(searchComplete, (e) => {
      searchComplete();
      throw e;
    });
  }
}
