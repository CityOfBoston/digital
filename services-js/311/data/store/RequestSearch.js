// @flow

import { observable, action, autorun, computed } from 'mobx';
// eslint-disable-next-line
import type { LatLngBounds } from 'leaflet';
import uniqBy from 'lodash/uniqBy';
import type { SearchRequest, SearchRequestsPage } from '../types';
import searchRequests from '../dao/search-requests';
import type { LoopbackGraphql } from '../dao/loopback-graphql';

type LatLng = {
  lat: number,
  lng: number,
};

export default class RequestSearch {
  // Setting these properties will cause a search to happen
  @observable.struct mapCenter: ?LatLng = null;
  @observable query: string = '';
  @observable radiusKm: number = 0;
  @observable resultsListWidth: number = 0;

  @observable mapBounds: ?LatLngBounds = null;

  @observable.shallow _results: SearchRequest[] = [];
  _resultsQuery: string = '';

  @observable.ref selectedRequest: ?SearchRequest = null;
  @observable selectedSource: ?string = null;

  searching: boolean = false;
  searchPending: boolean = false;
  searchDisposer: ?Function = null;

  @action.bound
  updateRequestSearchResults({ requests, query }: SearchRequestsPage) {
    // In this method we want to bring in the new requests, but preserve any
    // existing ones that match the location / query. Without this, moving
    // across the map could make requests disappear if they are not in the top
    // 100 of the new map center.
    //
    // We use this.results so we filter by bounds automatically.
    const previousResults = (query === this._resultsQuery) ? this.results : [];
    const newResults = uniqBy([...previousResults, ...requests], (r) => r.id);
    newResults.sort((a, b) => b.updatedAt - a.updatedAt);
    this._results = newResults;
    this._resultsQuery = query;
  }

  @computed get results(): SearchRequest[] {
    const { mapBounds } = this;
    if (!mapBounds) {
      return this._results;
    } else {
      return this._results.filter((r) => r.location && mapBounds.contains([r.location.lat, r.location.lng]));
    }
  }

  // Starting / stopping currently done in ReportLayout
  start(loopbackGraphql: LoopbackGraphql) {
    this.searching = false;
    this.searchPending = false;
    this.searchDisposer = autorun('RequestSearch auto-search', this.search.bind(this, loopbackGraphql));
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

    const searchComplete = action('search complete', () => {
      this.searching = false;
      if (this.searchPending) {
        this.search(loopbackGraphql);
      }
    });

    searchRequests(loopbackGraphql, query, mapCenter, radiusKm).then(this.updateRequestSearchResults).then(searchComplete, (e) => {
      searchComplete();
      throw e;
    });
  }
}
