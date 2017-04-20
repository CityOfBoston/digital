// @flow

import { observable, action, reaction, computed } from 'mobx';
// eslint-disable-next-line
import type { LatLngBounds } from 'leaflet';
import uniqBy from 'lodash/uniqBy';
import debounce from 'lodash/debounce';
import type { SearchRequest, SearchRequestsPage } from '../types';
import searchRequests from '../dao/search-requests';
import type { LoopbackGraphql } from '../dao/loopback-graphql';

type LatLng = {
  lat: number,
  lng: number,
};

type SearchArgs = {
  query: string,
  radiusKm: number,
  mapCenter: ?LatLng,
};

export default class RequestSearch {
  // Setting these properties will cause a search to happen
  @observable.struct mapCenter: ?LatLng = null;
  @observable query: string = '';
  @observable radiusKm: number = 0;

  @observable searchHeaderHeight: number = 0;
  @observable resultsListWidth: number = 0;

  @observable mapBounds: ?LatLngBounds = null;

  @observable.shallow _results: SearchRequest[] = [];
  _resultsQuery: string = '';

  @observable.ref selectedRequest: ?SearchRequest = null;
  @observable selectedSource: ?string = null;

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
      return this._results.slice(0, 50);
    } else {
      return this._results.filter((r) => r.location && mapBounds.contains([r.location.lat, r.location.lng])).slice(0, 50);
    }
  }

  // Starting / stopping currently done in ReportLayout
  start(loopbackGraphql: LoopbackGraphql) {
    // We use a reaction because the effect is debounced, which messes with
    // mobx's auto-detection of dependencies.
    this.searchDisposer = reaction(
      (): SearchArgs => ({
        mapCenter: this.mapCenter,
        radiusKm: this.radiusKm,
        query: this.query,
      }),
      debounce(this.search.bind(this, loopbackGraphql), 500),
      {
        name: 'RequestSearch auto-search',
        fireImmediately: true,
        compareStructural: true,
      },
    );
  }

  stop() {
    if (this.searchDisposer) {
      this.searchDisposer();
    }
  }

  async search(loopbackGraphql: LoopbackGraphql, { mapCenter, radiusKm, query }: SearchArgs) {
    if (!mapCenter || !radiusKm) {
      return;
    }

    const results = await searchRequests(loopbackGraphql, query, mapCenter, radiusKm);
    this.updateRequestSearchResults(results);
  }
}
