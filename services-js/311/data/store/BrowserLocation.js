// @flow

import { observable, action } from 'mobx';

export default class BrowserLocation {
  // false: not getting location
  // null: don't know location yet
  // lat/lng: browser location
  @observable location: false | null | { lat: number, lng: number } = null;

  watchId: mixed = null;

  hasNavigation() {
    return typeof navigator !== 'undefined' && !!navigator.geolocation;
  }

  attach() {
    if (!this.hasNavigation()) {
      this.location = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(this.handlePosition, this.handlePositionError, {
      enableHighAccuracy: false,
      timeout: Infinity,
      maximumAge: 60 * 60 * 1000,
    });

    navigator.geolocation.watchPosition(this.handlePosition, this.handlePositionError, {
      enableHighAccuracy: true,
      timeout: Infinity,
      maximumAge: 5 * 60 * 1000,
    });
  }

  detach() {
    if (!this.hasNavigation()) {
      return;
    }

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
