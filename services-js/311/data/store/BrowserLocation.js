// @flow

import { observable, action, runInAction, reaction } from 'mobx';

import type { LoopbackGraphql } from '../dao/loopback-graphql';
import reverseGeocode from '../dao/reverse-geocode';

export default class BrowserLocation {
  // false: not getting location
  // null: don't know location yet
  // lat/lng: browser location
  @observable location: false | null | {| lat: number, lng: number |} = null;
  @observable inBoston: boolean = false;

  watchId: ?number = null;
  loopbackGraphql: ?LoopbackGraphql;

  geocodeLocationDisposer: ?Function;

  hasNavigation() {
    return typeof navigator !== 'undefined' && !!navigator.geolocation;
  }

  attach(loopbackGraphql: ?LoopbackGraphql) {
    if (!this.hasNavigation()) {
      this.location = false;
      return;
    }

    this.loopbackGraphql = loopbackGraphql;

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
      async location => {
        if (location && this.loopbackGraphql) {
          const res = await reverseGeocode(this.loopbackGraphql, location);
          runInAction('browser location geocode result', () => {
            this.inBoston = !!res;
          });
        }
      },
      {
        name: 'browser location geocode',
        compareStructural: true,
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

    this.loopbackGraphql = null;

    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  @action.bound
  handlePosition(pos: Position) {
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
