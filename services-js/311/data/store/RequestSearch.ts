import {
  observable,
  action,
  reaction,
  computed,
  autorun,
  comparer,
} from 'mobx';
import { LatLngBounds } from 'mapbox.js';
import uniqBy from 'lodash/uniqBy';
import debounce from 'lodash/debounce';
import { SearchCase, SearchCasesResult } from '../types';
import searchCases from '../queries/search-cases';
import { FetchGraphql, GraphqlError } from '@cityofboston/next-client-common';

type LatLng = {
  lat: number;
  lng: number;
};

type SearchArgs = {
  query: string;
  topLeft: LatLng | null;
  bottomRight: LatLng | null;
};

/**
 * Any case numbers before this are assumed to be legacy. Any after are the new
 * Salesforce IDs.
 */
const LEGACY_CASE_CUTOFF = 3000000;

export default class RequestSearch {
  // Setting these properties will cause a search to happen
  // search center is the center of the visible map
  @observable query: string = '';

  // This is the center of the actual map element
  // TODO(finh): These probably should be somewhere more general
  @observable mapCenter: LatLng | null = null;
  @observable mapZoom: number = 12;

  @observable mapBounds: LatLngBounds | null = null;
  // true if the mobile search UI is showing just the map. We keep this in
  // store state so that it's preserved if you tap on a case and then go back
  @observable mapView: boolean = false;

  // We keep track of the first time the bounds are set because going from
  // null -> bounds shouldn't trigger that the map moved.
  boundsSet: boolean = false;
  mapMoved: boolean = false;

  @observable.shallow _results: SearchCase[] = [];
  @observable resultsQuery: string | null = null;
  @observable resultsError: Error | null = null;
  @observable loading: boolean = false;

  @observable.ref selectedRequest: SearchCase | null = null;
  @observable selectedSource: string | null = null;

  searchDisposer: Function | null = null;
  boundsSetDisposer: Function | null = null;

  /**
   * Given a search query, returns the URLs to its case if they match a format
   * used by our case IDs.
   *
   * Returns null if the query does not match our ID format.
   */
  static caseUrlsForSearchQuery(
    str: string | null
  ): { url: string; as: string } | null {
    const match = (str || '')
      .trim()
      .match(/#?((10100\d{7})|(\d\d-\d{8})|(\d{7,9}))$/);

    if (match) {
      let id = match[1];

      // match[4] is the numeric-only ID match. We check and see if we’re within
      // the window of legacy case IDs, in which case we add the Lagan case
      // prefix.
      if (match[4] && parseInt(match[4], 10) < LEGACY_CASE_CUTOFF) {
        id = `10100${id}`;
      }

      return { url: `/reports?id=${id}`, as: `/reports/${id}` };
    } else {
      return null;
    }
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
    newResults.sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
    this._results = newResults;
    this.resultsQuery = query;
  }

  @computed
  get results(): SearchCase[] {
    const { mapBounds } = this;
    if (!mapBounds) {
      return this._results.slice(0, 50);
    } else {
      return this._results
        .filter(({ location }) => {
          if (!location) {
            return false;
          }

          if (mapBounds) {
            return mapBounds.contains([location.lat, location.lng]);
          } else {
            return false;
          }
        })
        .slice(0, 50);
    }
  }

  // Starting / stopping currently done in SearchLayout
  start(fetchGraphql: FetchGraphql) {
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
      this.search.bind(this, fetchGraphql),
      {
        name: 'RequestSearch auto-search',
        fireImmediately: true,
        equals: comparer.structural,
      }
    );

    this.boundsSetDisposer = autorun(() => {
      if (this.boundsSet) {
        this.mapMoved = true;
      }

      this.boundsSet = !!this.mapBounds;
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
  get topLeft(): { lat: number; lng: number } | null {
    const { mapBounds } = this;

    if (mapBounds) {
      const { lat, lng } = mapBounds.getNorthWest();
      return { lat, lng };
    }

    return null;
  }

  @computed.struct
  get bottomRight(): { lat: number; lng: number } | null {
    const { mapBounds } = this;

    if (mapBounds) {
      const { lat, lng } = mapBounds.getSouthEast();
      return { lat, lng };
    }

    return null;
  }

  @action
  search(fetchGraphql: FetchGraphql, args: SearchArgs) {
    const { topLeft, bottomRight, query } = args;

    if (!topLeft || !bottomRight) {
      return;
    }

    if (RequestSearch.caseUrlsForSearchQuery(query)) {
      // The search UI will automatically route to case IDs, so we don't want to
      // do a search and show "no results" while that's loading.
      return;
    }

    this.loading = true;
    this.resultsError = null;

    this.debouncedSearch(fetchGraphql, args);
  }

  debouncedSearch = debounce(this.internalSearch.bind(this), 500);

  internalSearch(
    fetchGraphql: FetchGraphql,
    { topLeft, bottomRight, query }: SearchArgs
  ) {
    searchCases(fetchGraphql, query, topLeft, bottomRight).then(
      action('searchCases success', (results: SearchCasesResult) => {
        this.loading = false;
        this.updateCaseSearchResults(results);
      }),
      action('searchCases failure', (err: GraphqlError) => {
        this.loading = false;
        this.resultsError = err;
        window.Rollbar && err.source !== 'server' && window.Rollbar.error(err);
      })
    );
  }
}
