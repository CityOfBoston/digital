// @flow

import { observable, action, reaction, computed, runInAction } from 'mobx';
// eslint-disable-next-line
import type { LatLngBounds } from 'leaflet';
import type { LngLatBounds } from 'mapbox-gl';
import uniqBy from 'lodash/uniqBy';
import debounce from 'lodash/debounce';
import type { SearchCase, SearchCasesResult } from '../types';
import searchCases from '../dao/search-cases';
import type { LoopbackGraphql } from '../dao/loopback-graphql';

type LatLng = {
  lat: number,
  lng: number,
};

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

  @observable resultsListWidth: number = 0;

  @observable mapBounds: ?LatLngBounds = null;
  @observable mapBoundsGl: ?LngLatBounds = null;
  // true if the mobile search UI is showing just the map. We keep this in
  // store state so that it's preserved if you tap on a case and then go back
  @observable mapView: boolean = false;

  @observable.shallow _results: SearchCase[] = [];
  @observable resultsQuery: ?string = null;
  @observable loading: boolean = false;

  @observable.ref selectedRequest: ?SearchCase = null;
  @observable selectedSource: ?string = null;

  searchDisposer: ?Function = null;

  updateCaseSearchResults({ cases, query }: SearchCasesResult) {
    // In this method we want to bring in the new cases, but preserve any
    // existing ones that match the location / query. Without this, moving
    // across the map could make cases disappear if they are not in the top
    // 100 of the new map center.
    //
    // We use this.results so we filter by bounds automatically.
    const previousResults = (query === this.resultsQuery) ? this.results : [];
    const newResults = uniqBy([...previousResults, ...cases], (r) => r.id);
    newResults.sort((a, b) => b.requestedAt - a.requestedAt);
    this._results = newResults;
    this.resultsQuery = query;
  }

  @computed get results(): SearchCase[] {
    const { mapBounds, mapBoundsGl } = this;
    if (!mapBounds && !mapBoundsGl) {
      return this._results.slice(0, 50);
    } else {
      return this._results.filter(({ location }) => {
        if (!location) {
          return false;
        }

        if (mapBounds) {
          return mapBounds.contains([location.lat, location.lng]);
        } else if (mapBoundsGl) {
          return (location.lng >= mapBoundsGl.getWest() &&
              location.lng <= mapBoundsGl.getEast() &&
              location.lat <= mapBoundsGl.getNorth() &&
              location.lat >= mapBoundsGl.getSouth());
        } else {
          return false;
        }
      }).slice(0, 50);
    }
  }

  // Starting / stopping currently done in SearchLayout
  start(loopbackGraphql: LoopbackGraphql) {
    // We use a reaction because the effect is debounced, which messes with
    // mobx's auto-detection of dependencies.
    this.searchDisposer = reaction(
      (): SearchArgs => ({
        topLeft: this.topLeft,
        bottomRight: this.bottomRight,
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

  @computed.struct get topLeft(): ?{ lat: number, lng: number } {
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

  @computed.struct get bottomRight(): ?{ lat: number, lng: number } {
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
  async search(loopbackGraphql: LoopbackGraphql, { topLeft, bottomRight, query }: SearchArgs) {
    if (!topLeft || !bottomRight) {
      return;
    }

    this.loading = true;

    const results = await searchCases(loopbackGraphql, query, topLeft, bottomRight);

    runInAction('request search results', () => {
      this.loading = false;
      this.updateCaseSearchResults(results);
    });
  }
}
