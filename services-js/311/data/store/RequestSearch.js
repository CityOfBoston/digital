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
  searchCenter: ?LatLng,
};

export default class RequestSearch {
  // Setting these properties will cause a search to happen
  // search center is the center of the visible map
  @observable.struct searchCenter: ?LatLng = null;
  @observable query: string = '';
  @observable radiusKm: number = 0;

  // This is the center of the actual map element
  // TODO(finh): These probably should be somewhere more general
  @observable mapCenter: ?LatLng = null;
  @observable mapZoom: number = 12;

  @observable resultsListWidth: number = 0;

  @observable mapBounds: ?LatLngBounds = null;

  @observable.shallow _results: SearchRequest[] = [];
  @observable resultsQuery: ?string = null;

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
    const previousResults = (query === this.resultsQuery) ? this.results : [];
    const newResults = uniqBy([...previousResults, ...requests], (r) => r.id);
    newResults.sort((a, b) => b.updatedAt - a.updatedAt);
    this._results = newResults;
    this.resultsQuery = query;
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
        searchCenter: this.searchCenter,
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

  async search(loopbackGraphql: LoopbackGraphql, { searchCenter, radiusKm, query }: SearchArgs) {
    if (!searchCenter || !radiusKm) {
      return;
    }

    const results = await searchRequests(loopbackGraphql, query, searchCenter, radiusKm);
    this.updateRequestSearchResults(results);
  }
}
