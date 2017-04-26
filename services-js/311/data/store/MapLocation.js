// @flow

import { observable, action, runInAction } from 'mobx';

import type { LoopbackGraphql } from '../dao/loopback-graphql';
import reverseGeocode from '../dao/reverse-geocode';

export default class MapLocation {
  @observable location: ?{ lat: number, lng: number } = null;
  @observable address: string = '';

  loopbackGraphql: ?LoopbackGraphql;

  start(loopbackGraphql: LoopbackGraphql) {
    this.loopbackGraphql = loopbackGraphql;
  }

  stop() {
    this.loopbackGraphql = null;
  }

  @action
  async geocodeLocation(location: {lat: number, lng: number}): Promise<void> {
    this.location = location;

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
        }
      }
    });
  }
}
