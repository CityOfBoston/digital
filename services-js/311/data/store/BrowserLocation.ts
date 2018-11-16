import { observable, action, reaction, comparer } from 'mobx';

import { FetchGraphql } from '@cityofboston/next-client-common';

import reverseGeocode from '../queries/reverse-geocode';
import { ReverseGeocodeResult } from '../types';

type Location = false | null | { lat: number; lng: number };

export default class BrowserLocation {
  // false: not getting location
  // null: don't know location yet
  // lat/lng: browser location
  @observable location: Location = null;
  @observable inBoston: boolean = false;

  watchId: number | null = null;
  fetchGraphql: FetchGraphql | null = null;

  geocodeLocationDisposer: Function | null = null;

  hasNavigation() {
    return typeof navigator !== 'undefined' && !!navigator.geolocation;
  }

  attach(fetchGraphql: FetchGraphql | null) {
    if (!this.hasNavigation()) {
      this.location = false;
      return;
    }

    this.fetchGraphql = fetchGraphql;

    navigator.geolocation.getCurrentPosition(
      this.handlePosition,
      this.handlePositionError,
      {
        enableHighAccuracy: false,
        timeout: Number.MAX_SAFE_INTEGER,
        maximumAge: 60 * 60 * 1000,
      }
    );

    navigator.geolocation.watchPosition(
      this.handlePosition,
      this.handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: Number.MAX_SAFE_INTEGER,
        maximumAge: 5 * 60 * 1000,
      }
    );

    // Use a reaction to do the geocode so we get free structural comparison
    // when location stays the same
    this.geocodeLocationDisposer = reaction(
      () => this.location,
      (location: Location) => {
        if (location && this.fetchGraphql) {
          reverseGeocode(this.fetchGraphql, location).then(
            action((res: ReverseGeocodeResult) => {
              this.inBoston = !!res;
            })
          );
        }
      },
      {
        name: 'browser location geocode',
        equals: comparer.structural,
        fireImmediately: true,
      }
    );
  }

  detach() {
    if (!this.hasNavigation()) {
      return;
    }

    if (this.geocodeLocationDisposer) {
      this.geocodeLocationDisposer();
      this.geocodeLocationDisposer = null;
    }

    this.fetchGraphql = null;

    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  @action.bound
  handlePosition(pos: any) {
    this.location = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
  }

  @action.bound
  handlePositionError(err: PositionError) {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        this.location = false;
        break;
      default:
        break;
    }
  }
}
