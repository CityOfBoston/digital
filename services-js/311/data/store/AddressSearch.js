// @flow

import { observable, action, computed, runInAction } from 'mobx';

import type { LoopbackGraphql } from '../dao/loopback-graphql';
import searchAddress from '../dao/search-address';
import reverseGeocode from '../dao/reverse-geocode';
import type { AddressUnit, SearchAddressPlace } from '../types';

// This class co-ordinates location queries between the LocationPopUp pane
// and the LocationMap map. LocationPopUp automatically updates the
// RequestForm (which contains the data that will go into the request) based
// on changes to this instance.
export default class AddressSearch {
  @observable query: string = '';
  @observable searching: boolean = false;
  @observable lastQuery: string = '';
  @observable.ref lastSearchError: ?Error = null;

  @observable.shallow places: ?Array<SearchAddressPlace> = null;
  @observable _currentPlaceIndex: number = -1;
  @observable highlightedPlaceIndex: number = -1;
  @observable _currentUnitIndex: number = 0;
  @observable
  currentReverseGeocodeLocation: ?{ lat: number, lng: number } = null;
  @observable currentReverseGeocodeLocationIsValid: boolean = true;

  @observable mode: 'search' | 'geocode' = 'search';

  // We keep track of whether the constituent seems to be pointing at a location
  // on the map or choosing from the location menu, since we have to choose to
  // send either lat/lng *or* address string to Open311. lat/lng matches the map
  // exactly, but only address string captures the unit.
  @observable intent: 'ADDRESS' | 'LATLNG' = 'ADDRESS';

  // Used so that LocationMap doesn't zoom things under the search box.
  searchPopupWidth: number = 0;

  loopbackGraphql: ?LoopbackGraphql;

  start(loopbackGraphql: LoopbackGraphql) {
    this.loopbackGraphql = loopbackGraphql;
  }

  stop() {
    this.loopbackGraphql = null;
  }

  @computed
  get currentPlaceIndex(): number {
    return this._currentPlaceIndex;
  }

  set currentPlaceIndex(currentPlaceIndex: number) {
    this._currentPlaceIndex = currentPlaceIndex;
    this.intent = 'ADDRESS';
  }

  @computed
  get currentUnitIndex(): number {
    return this._currentUnitIndex;
  }

  set currentUnitIndex(currentUnitIndex: number) {
    this._currentUnitIndex = currentUnitIndex;
    this.intent = 'ADDRESS';
  }

  @action
  async search(selectFirst: boolean): Promise<void> {
    if (!this.loopbackGraphql) {
      return;
    }

    this.places = null;
    this.lastQuery = this.query;
    this.lastSearchError = null;
    this.currentReverseGeocodeLocation = null;
    this.mode = 'search';

    if (!this.query) {
      return;
    }

    try {
      this.searching = true;
      const places = await searchAddress(this.loopbackGraphql, this.query);

      runInAction('search - searchAddress success', () => {
        this.searching = false;
        this.places = places;
        this.currentPlaceIndex = places.length === 1 || selectFirst ? 0 : -1;
        this.highlightedPlaceIndex = this.currentPlaceIndex;
        this.currentUnitIndex = 0;
        this.intent = 'ADDRESS';
      });
    } catch (err) {
      runInAction('search - searchAddress error', () => {
        this.searching = false;
        this.lastSearchError = err;
        window._opbeat &&
          !err.server &&
          window._opbeat('captureException', err);
      });
    }
  }

  @computed
  get location(): ?{ lat: number, lng: number } {
    return (
      this.currentReverseGeocodeLocation ||
      (this.currentPlace ? this.currentPlace.location : null)
    );
  }

  set location(location: {| lat: number, lng: number |}) {
    this.query = '';

    if (
      this.location &&
      this.location.lat === location.lat &&
      this.location.lng === location.lng
    ) {
      return;
    }

    if (!this.loopbackGraphql) {
      return;
    }

    this.currentReverseGeocodeLocation = location;
    this.places = null;
    this.mode = 'geocode';
    this.lastQuery = '';
    this.lastSearchError = null;

    this.searching = true;
    reverseGeocode(this.loopbackGraphql, location).then(
      action('reverseGeocode success', place => {
        this.searching = false;

        if (place) {
          // We overwrite the location in the place to stay with the one picked so
          // that the map marker doesn’t move.
          this.places = [
            {
              location,
              address: place.address,
              addressId: place.addressId,
              units: place.units,
            },
          ];
          this.currentPlaceIndex = 0;
          this.highlightedPlaceIndex = 0;
          this.currentUnitIndex = 0;
          this.currentReverseGeocodeLocationIsValid = true;
          this.intent = 'LATLNG';
        } else {
          this.places = [];
          this.currentPlaceIndex = 0;
          this.highlightedPlaceIndex = 0;
          this.currentUnitIndex = 0;
          this.currentReverseGeocodeLocationIsValid = false;
        }
      }),
      action('reverseGeocode error', err => {
        this.searching = false;
        this.lastSearchError = err;
        window._opbeat && window._opbeat('captureException', err);
      })
    );
  }

  @computed
  get currentPlace(): ?SearchAddressPlace {
    return (
      (this.places &&
        this.places.length > this.currentPlaceIndex &&
        this.places[this.currentPlaceIndex]) ||
      null
    );
  }

  @computed
  get currentUnit(): ?AddressUnit {
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
  get addressId(): ?string {
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
