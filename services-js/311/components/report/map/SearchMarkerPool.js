// @flow

import { action, computed, autorun } from 'mobx';
import type { IComputedValue } from 'mobx';
// eslint-disable-next-line
import type { Map as GoogleMap, MapsEventListener, Marker, LatLng, MapOptions } from 'google-maps';
import type RequestSearch from '../../../data/store/RequestSearch';
import type { SearchRequest } from '../../../data/types';

// Reactive wrapper around Google Maps' Marker that responds to visibility and
// hover state.
class SearchMarker {
  marker: Marker;
  map: GoogleMap;
  request: SearchRequest;
  requestSearch: RequestSearch;
  opacityComputed: IComputedValue<number>;
  updateOpacityDisposer: Function;
  updateIconDisposer: Function;

  constructor(MarkerClass: Class<Marker>, map: GoogleMap, requestSearch: RequestSearch, opacityComputed: IComputedValue<number>, request: SearchRequest) {
    this.request = request;
    this.map = map;
    this.requestSearch = requestSearch;
    this.opacityComputed = opacityComputed;

    if (!request.location) {
      throw new Error(`Request ${request.id} did not have a location`);
    }

    this.marker = new MarkerClass({
      position: {
        lat: request.location.lat,
        lng: request.location.lng,
      },
    });

    this.marker.addListener('click', this.handleClick);
    this.updateOpacityDisposer = autorun('updateOpacity', this.updateOpacity);
    this.updateIconDisposer = autorun('updateIcon', this.updateIcon);
  }

  dispose() {
    this.updateOpacityDisposer();
    this.updateIconDisposer();
    this.marker.setMap(null);
  }

  @action.bound handleClick() {
    this.requestSearch.selectedRequest = this.request;
    this.requestSearch.selectedSource = 'marker';
  }

  @computed get selected(): boolean {
    return this.requestSearch.selectedRequest === this.request;
  }

  updateIcon = () => {
    let icon;

    if (this.request.status === 'open') {
      if (this.selected) {
        icon = '/static/img/waypoint-open-selected.png';
      } else {
        icon = '/static/img/waypoint-open.png';
      }
    } else {
      if (this.selected) {
        icon = '/static/img/waypoint-closed-selected.png';
      } else {
        icon = '/static/img/waypoint-closed.png';
      }
    }

    this.marker.setIcon(icon);
    this.marker.setZIndex(this.selected ? 1 : 0);
  }

  updateOpacity = () => {
    const opacity = this.opacityComputed.get();
    const map = opacity === 0 ? null : this.map;

    this.marker.setOpacity(opacity);

    // we remove the marker from the map if opacity is 0 so it doesn't get
    // clicks
    if (this.marker.getMap() !== map) {
      this.marker.setMap(map);
    }
  }
}

export default class SearchMarkerPool {
  MarkerClass: Class<Marker>;
  map: GoogleMap;
  requestSearch: RequestSearch;
  opacityComputed: IComputedValue<number>;

  maintainMarkersDisposer: Function;
  markers: {[id: string]: SearchMarker} = {};

  constructor(MarkerClass: Class<Marker>, map: GoogleMap, requestSearch: RequestSearch, opacityComputed: IComputedValue<number>) {
    this.MarkerClass = MarkerClass;
    this.map = map;
    this.requestSearch = requestSearch;
    this.opacityComputed = opacityComputed;

    this.maintainMarkersDisposer = autorun('maintainMarkers', this.maintainMarkers);
  }

  dispose() {
    this.maintainMarkersDisposer();
    Object.keys(this.markers).forEach((id) => {
      this.markers[id].dispose();
    });
    this.markers = {};
  }

  maintainMarkers = () => {
    const newMarkers = {};

    this.requestSearch.results.forEach((request) => {
      if (!request.location) {
        return;
      }

      if (this.markers[request.id]) {
        newMarkers[request.id] = this.markers[request.id];
        delete this.markers[request.id];
      } else {
        newMarkers[request.id] = new SearchMarker(this.MarkerClass, this.map, this.requestSearch, this.opacityComputed, request);
      }
    });

    // Anything left in markers is no longer in the search results, so we dispose
    // to pull it from the map and remove watching.
    Object.keys(this.markers).forEach((id) => {
      this.markers[id].dispose();
    });

    this.markers = newMarkers;
  }

}
