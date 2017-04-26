// @flow

import { observable, reaction, runInAction } from 'mobx';

import type { LoopbackGraphql } from '../dao/loopback-graphql';
import reverseGeocode from '../dao/reverse-geocode';

export default class MapLocation {
  @observable location: ?{ lat: number, lng: number } = null;
  @observable address: string = '';

  reverseGeocodeDisposer: ?Function;

  start(loopbackGraphql: LoopbackGraphql) {
    this.reverseGeocodeDisposer = reaction(
      () => this.location,
      async (location) => {
        if (!location || this.address) {
          return;
        }

        const place = await reverseGeocode(loopbackGraphql, location);

        runInAction('reverse geocode result', () => {
          if (this.location && this.location.lat === location.lat && this.location.lng === location.lng) {
            if (place) {
              this.address = place.address;
            } else {
              this.address = '';
            }
          }
        });
      },
      {
        name: 'reverse geocoder',
        fireImmediately: true,
      },
    );
  }

  stop() {
    if (this.reverseGeocodeDisposer) {
      this.reverseGeocodeDisposer();
      this.reverseGeocodeDisposer = null;
    }
  }
}
