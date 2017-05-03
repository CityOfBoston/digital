// @flow

import { observable, action, runInAction } from 'mobx';

import type { LoopbackGraphql } from '../dao/loopback-graphql';
import searchAddress from '../dao/search-address';
import reverseGeocode from '../dao/reverse-geocode';

// This class co-ordinates location queries between the LocationPopUp pane
// and the LocationMap map. LocationPopUp automatically updates the
// RequestForm (which contains the data that will go into the request) based
// on changes to this instance.
export default class MapLocation {
  @observable location: ?{ lat: number, lng: number } = null;
  @observable query: string = '';
  @observable address: string = '';
  @observable addressId: ?string = null;
  @observable notFound: boolean = false;

  loopbackGraphql: ?LoopbackGraphql;

  start(loopbackGraphql: LoopbackGraphql) {
    this.loopbackGraphql = loopbackGraphql;
  }

  stop() {
    this.loopbackGraphql = null;
  }

  @action
  async search(query: string): Promise<void> {
    this.notFound = false;
    this.location = null;
    this.addressId = null;

    if (!this.loopbackGraphql) {
      return;
    }

    const place = await searchAddress(this.loopbackGraphql, query);

    runInAction('address search result', () => {
      if (place) {
        this.location = place.location;
        this.address = place.address;
        this.addressId = place.addressId;
      } else {
        this.address = '';
        this.addressId = null;
        this.notFound = true;
      }
    });
  }

  @action
  async geocodeLocation(location: {lat: number, lng: number}): Promise<void> {
    if (this.location && this.location.lat === location.lat && this.location.lng === location.lng) {
      return;
    }

    this.location = location;
    this.notFound = false;

    if (!this.loopbackGraphql) {
      return;
    }

    const place = await reverseGeocode(this.loopbackGraphql, location);

    runInAction('reverse geocode result', () => {
      if (this.location && this.location.lat === location.lat && this.location.lng === location.lng) {
        if (place) {
          this.address = place.address;
        } else {
          this.address = '';
          this.notFound = true;
        }
      }
    });
  }
}
