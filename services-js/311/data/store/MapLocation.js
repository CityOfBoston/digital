// @flow

import { observable, action } from 'mobx';

import type { LoopbackGraphql } from '../dao/loopback-graphql';
import searchAddress from '../dao/search-address';
import reverseGeocode from '../dao/reverse-geocode';
import type { AddressUnit, SearchAddressPlace } from '../types';

// This class co-ordinates location queries between the LocationPopUp pane
// and the LocationMap map. LocationPopUp automatically updates the
// RequestForm (which contains the data that will go into the request) based
// on changes to this instance.
export default class MapLocation {
  @observable location: ?{ lat: number, lng: number } = null;
  @observable query: string = '';
  @observable address: string = '';
  @observable addressId: ?string = null;
  @observable units: Array<AddressUnit> = [];
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

    this.handleSearchResult(place);
  }

  @action
  async geocodeLocation(location: {|
    lat: number,
    lng: number,
  |}): Promise<void> {
    if (
      this.location &&
      this.location.lat === location.lat &&
      this.location.lng === location.lng
    ) {
      return;
    }

    this.location = location;
    this.notFound = false;

    if (!this.loopbackGraphql) {
      return;
    }

    const place = await reverseGeocode(this.loopbackGraphql, location);

    if (place) {
      // We overwrite the location in the place to stay with the one picked so
      // that the map marker doesn’t move.
      this.handleSearchResult({
        location,
        address: place.address,
        addressId: place.addressId,
        units: place.units,
      });
    } else {
      this.handleSearchResult(null);
    }
  }

  @action
  handleSearchResult(place: ?SearchAddressPlace) {
    if (place) {
      this.location = place.location;
      this.address = place.address;
      this.addressId = place.addressId;
      this.units = place.units;
    } else {
      this.address = '';
      this.addressId = null;
      this.notFound = true;
      this.units = [];
    }
  }
}
