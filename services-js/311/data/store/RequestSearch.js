// @flow

import { observable, action, reaction, computed, autorun } from 'mobx';
// eslint-disable-next-line
import type { LatLngBounds } from 'mapbox.js';
import type { LngLatBounds } from 'mapbox-gl';
import uniqBy from 'lodash/uniqBy';
import debounce from 'lodash/debounce';
import type { SearchCase, SearchCasesResult } from '../types';
import searchCases from '../dao/search-cases';
import type { LoopbackGraphql } from '../dao/loopback-graphql';

type LatLng = {|
  lat: number,
  lng: number,
|};

type SearchArgs = {
  query: string,
  topLeft: ?LatLng,
  bottomRight: ?LatLng,
};

export default class RequestSearch {
  // Setting these properties will cause a search to happen
  // search center is the center of the visible map
  @observable query: string = '';

  // This is the center of the actual map element
  // TODO(finh): These probably should be somewhere more general
  @observable mapCenter: ?LatLng = null;
  @observable mapZoom: number = 12;

  @observable mapBounds: ?LatLngBounds = null;
  @observable mapBoundsGl: ?LngLatBounds = null;
  // true if the mobile search UI is showing just the map. We keep this in
  // store state so that it's preserved if you tap on a case and then go back
  @observable mapView: boolean = false;

  // We keep track of the first time the bounds are set because going from
  // null -> bounds shouldn't trigger that the map moved.
  boundsSet: boolean = false;
  mapMoved: boolean = false;

  @observable.shallow _results: SearchCase[] = [];
  @observable resultsQuery: ?string = null;
  @observable resultsError: ?Error = null;
  @observable loading: boolean = false;

  @observable.ref selectedRequest: ?SearchCase = null;
  @observable selectedSource: ?string = null;

  searchDisposer: ?Function = null;
  boundsSetDisposer: ?Function = null;

  static isCaseId(str: ?string): boolean {
    return !!str && !!str.trim().match(/(1010\d{8})|(\d\d-\d{8})$/);
  }

  updateCaseSearchResults({ cases, query }: SearchCasesResult) {
    // In this method we want to bring in the new cases, but preserve any
    // existing ones that match the location / query. Without this, moving
    // across the map could make cases disappear if they are not in the top
    // 100 of the new map center.
    //
    // We use this.results so we filter by bounds automatically.
    const previousResults = query === this.resultsQuery ? this.results : [];
    const newResults = uniqBy([...previousResults, ...cases], r => r.id);
    newResults.sort((a, b) => b.requestedAt - a.requestedAt);
    this._results = newResults;
    this.resultsQuery = query;
  }

  @computed
  get results(): SearchCase[] {
    const { mapBounds, mapBoundsGl } = this;
    if (!mapBounds && !mapBoundsGl) {
      return this._results.slice(0, 50);
    } else {
      return this._results
        .filter(({ location }) => {
          if (!location) {
            return false;
          }

          if (mapBounds) {
            return mapBounds.contains([location.lat, location.lng]);
          } else if (mapBoundsGl) {
            return (
              location.lng >= mapBoundsGl.getWest() &&
              location.lng <= mapBoundsGl.getEast() &&
              location.lat <= mapBoundsGl.getNorth() &&
              location.lat >= mapBoundsGl.getSouth()
            );
          } else {
            return false;
          }
        })
        .slice(0, 50);
    }
  }

  // Starting / stopping currently done in SearchLayout
  start(loopbackGraphql: LoopbackGraphql) {
    this.boundsSet = false;
    this.mapMoved = false;

    // We use a reaction because the effect is debounced, which messes with
    // mobx's auto-detection of dependencies.
    this.searchDisposer = reaction(
      (): SearchArgs => ({
        topLeft: this.topLeft,
        bottomRight: this.bottomRight,
        query: this.query,
      }),
      this.search.bind(this, loopbackGraphql),
      {
        name: 'RequestSearch auto-search',
        fireImmediately: true,
        compareStructural: true,
      }
    );

    this.boundsSetDisposer = autorun(() => {
      if (this.boundsSet) {
        this.mapMoved = true;
      }

      this.boundsSet = !!(this.mapBounds || this.mapBoundsGl);
    });
  }

  stop() {
    if (this.searchDisposer) {
      this.searchDisposer();
    }

    if (this.boundsSetDisposer) {
      this.boundsSetDisposer();
    }
  }

  @computed.struct
  get topLeft(): ?{| lat: number, lng: number |} {
    const { mapBounds, mapBoundsGl } = this;

    if (mapBounds) {
      const { lat, lng } = mapBounds.getNorthWest();
      return { lat, lng };
    }

    if (mapBoundsGl) {
      const { lat, lng } = mapBoundsGl.getNorthWest();
      return { lat, lng };
    }

    return null;
  }

  @computed.struct
  get bottomRight(): ?{| lat: number, lng: number |} {
    const { mapBounds, mapBoundsGl } = this;

    if (mapBounds) {
      const { lat, lng } = mapBounds.getSouthEast();
      return { lat, lng };
    }

    if (mapBoundsGl) {
      const { lat, lng } = mapBoundsGl.getSouthEast();
      return { lat, lng };
    }

    return null;
  }

  @action
  search(loopbackGraphql: LoopbackGraphql, args: SearchArgs) {
    const { topLeft, bottomRight, query } = args;

    if (!topLeft || !bottomRight) {
      return;
    }

    if (RequestSearch.isCaseId(query)) {
      // The search UI will automatically route to case IDs, so we don't want to
      // do a search and show "no results" while that's loading.
      return;
    }

    this.loading = true;
    this.resultsError = null;

    this.debouncedSearch(loopbackGraphql, args);
  }

  debouncedSearch = debounce(this.internalSearch.bind(this), 500);

  internalSearch(
    loopbackGraphql: LoopbackGraphql,
    { topLeft, bottomRight, query }: SearchArgs
  ) {
    searchCases(loopbackGraphql, query, topLeft, bottomRight).then(
      action('searchCases success', results => {
        this.loading = false;
        this.updateCaseSearchResults(results);
      }),
      action('searchCases failure', err => {
        this.loading = false;
        this.resultsError = err;
        window._opbeat && window._opbeat('captureException', err);
      })
    );
  }
}
