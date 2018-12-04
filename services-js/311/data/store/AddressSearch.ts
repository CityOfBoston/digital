import { observable, action, computed, runInAction } from 'mobx';

import { FetchGraphql, GraphqlError } from '@cityofboston/next-client-common';

import searchAddress from '../queries/search-address';
import reverseGeocode from '../queries/reverse-geocode';
import {
  AddressUnit,
  SearchAddressPlace,
  ReverseGeocodeResult,
} from '../types';

// This class co-ordinates location queries between the LocationPopUp pane
// and the LocationMap map. LocationPopUp automatically updates the
// RequestForm (which contains the data that will go into the request) based
// on changes to this instance.
export default class AddressSearch {
  @observable query: string = '';
  @observable searching: boolean = false;
  @observable lastQuery: string = '';
  @observable.ref lastSearchError: Error | null = null;

  @observable.shallow private _places: Array<SearchAddressPlace> | null = null;
  @observable private _currentPlaceIndex: number = -1;
  @observable highlightedPlaceIndex: number = -1;
  @observable private _currentUnitIndex: number = 0;
  @observable
  currentReverseGeocodeLocation: { lat: number; lng: number } | null = null;
  @observable currentReverseGeocodeLocationIsValid: boolean = true;

  @observable mode: 'search' | 'geocode' = 'search';

  // We keep track of whether the constituent seems to be pointing at a location
  // on the map or choosing from the location menu, since we have to choose to
  // send either lat/lng *or* address string to Open311. lat/lng matches the map
  // exactly, but only address string captures the unit.
  @observable intent: 'ADDRESS' | 'LATLNG' = 'ADDRESS';

  // Used so that LocationMap doesn't zoom things under the search box.
  searchPopupWidth: number = 0;

  private fetchGraphql: FetchGraphql | null = null;

  start(fetchGraphql: FetchGraphql) {
    this.fetchGraphql = fetchGraphql;
  }

  stop() {
    this.fetchGraphql = null;
  }

  @computed
  get places(): Array<SearchAddressPlace> | null {
    return this._places;
  }

  clearPlaces() {
    this._places = null;
  }

  setPlaces(
    places: Array<SearchAddressPlace> | null,
    mode: 'search' | 'geocode',
    selectFirst: boolean
  ) {
    this._places = places;

    // These calls are not going through the setters to avoid changing the intent.
    this._currentPlaceIndex =
      places && (places.length === 1 || selectFirst) ? 0 : -1;
    this.highlightedPlaceIndex = this._currentPlaceIndex;
    this._currentUnitIndex = 0;

    if (
      mode === 'search' &&
      (!this.currentPlace || !this.currentPlace.alwaysUseLatLng)
    ) {
      this.intent = 'ADDRESS';
    } else {
      this.intent = 'LATLNG';
    }
  }

  @computed
  get currentPlaceIndex(): number {
    return this._currentPlaceIndex;
  }

  set currentPlaceIndex(currentPlaceIndex: number) {
    if (currentPlaceIndex === this._currentPlaceIndex) {
      return;
    }

    this._currentPlaceIndex = currentPlaceIndex;
    // We specifically just set the private variable because the
    // currentUnitIndex setter forces the intent to "ADDRESS," which is not what
    // we want if we're picking an address or something else with
    // alwaysUseLatLng.
    this._currentUnitIndex = 0;

    // Your intent should likely already be 'ADDRESS' in this case, because
    // picking from multiple places means that you did a forward search and the
    // intent was already address. Regardless, since you chose something by
    // name, we update the intent unless it’s a place that should never be
    // referenced by name (which for now means an intersection).
    const place = this._places && this._places[currentPlaceIndex];
    if (place) {
      this.intent = place.alwaysUseLatLng ? 'LATLNG' : 'ADDRESS';
    }
  }

  @computed
  get currentUnitIndex(): number {
    return this._currentUnitIndex;
  }

  set currentUnitIndex(currentUnitIndex: number) {
    this._currentUnitIndex = currentUnitIndex;
    // If you're changing the unit, we need to send the address string along so
    // the backend can seach for which unit you chose. This won't be called for
    // intersections because they don't have units.
    this.intent = 'ADDRESS';
  }

  @action
  async search(selectFirst: boolean): Promise<void> {
    const { fetchGraphql } = this;

    if (!fetchGraphql) {
      return;
    }

    this.clearPlaces();
    this.lastQuery = this.query;
    this.lastSearchError = null;
    this.currentReverseGeocodeLocation = null;
    this.mode = 'search';

    if (!this.query) {
      return;
    }

    try {
      this.searching = true;
      const places = await searchAddress(fetchGraphql, this.query);

      (runInAction as any)('search - searchAddress success', () => {
        this.searching = false;
        this.setPlaces(places, 'search', selectFirst);
      });
    } catch (err) {
      (runInAction as any)('search - searchAddress error', () => {
        this.searching = false;
        this.lastSearchError = err;

        window.Rollbar && err.source !== 'server' && window.Rollbar.error(err);
      });
    }
  }

  @computed
  get location(): { lat: number; lng: number } | null {
    return (
      this.currentReverseGeocodeLocation ||
      (this.currentPlace ? this.currentPlace.location : null)
    );
  }

  set location(location: { lat: number; lng: number } | null) {
    if (!location) {
      this.clearPlaces();
      return;
    }

    const { fetchGraphql } = this;

    this.query = '';

    if (
      this.location &&
      this.location.lat === location.lat &&
      this.location.lng === location.lng
    ) {
      return;
    }

    if (!fetchGraphql) {
      return;
    }

    this.currentReverseGeocodeLocation = location;
    this.clearPlaces();
    this.mode = 'geocode';
    this.lastQuery = '';
    this.lastSearchError = null;

    this.searching = true;
    reverseGeocode(fetchGraphql, location).then(
      action('reverseGeocode success', (place: ReverseGeocodeResult) => {
        this.searching = false;

        if (place) {
          // We overwrite the location in the place to stay with the one picked so
          // that the map marker doesn’t move.
          this.setPlaces(
            [
              {
                location,
                address: place.address,
                addressId: place.addressId,
                exact: place.exact,
                units: place.units,
                alwaysUseLatLng: place.alwaysUseLatLng,
              },
            ],
            'geocode',
            true
          );

          this.currentReverseGeocodeLocationIsValid = true;
        } else {
          this.setPlaces([], 'geocode', true);
          this.currentReverseGeocodeLocationIsValid = false;
        }
      }),
      action('reverseGeocode error', (err: GraphqlError) => {
        this.searching = false;
        this.lastSearchError = err;
        window.Rollbar && err.source !== 'server' && window.Rollbar.error(err);
      })
    );
  }

  @computed
  get currentPlace(): SearchAddressPlace | null {
    return (
      (this.places &&
        this.places.length > this.currentPlaceIndex &&
        this.places[this.currentPlaceIndex]) ||
      null
    );
  }

  @computed
  get currentUnit(): AddressUnit | null {
    return (
      (this.currentPlace &&
        this.currentPlace.units.length > this.currentUnitIndex &&
        this.currentPlace.units[this.currentUnitIndex]) ||
      null
    );
  }

  @computed
  get notFound(): boolean {
    return !!this.places && this.places.length === 0;
  }

  @computed
  get address(): string {
    if (this.currentUnit) {
      return this.currentUnit.address;
    } else if (this.currentPlace) {
      return this.currentPlace.address;
    } else {
      return '';
    }
  }

  @computed
  get addressId(): string | null {
    if (this.currentUnit) {
      return this.currentUnit.addressId;
    } else if (this.currentPlace) {
      return this.currentPlace.addressId;
    } else {
      return null;
    }
  }

  @computed
  get units(): Array<AddressUnit> {
    return this.currentPlace ? this.currentPlace.units : [];
  }
}
