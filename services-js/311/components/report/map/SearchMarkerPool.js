// @flow

import { action, computed, autorun } from 'mobx';
import type { IComputedValue } from 'mobx';
import type { Map as MapboxMap, Marker, DivIcon } from 'mapbox.js';
import type RequestSearch from '../../../data/store/RequestSearch';
import type { SearchRequest } from '../../../data/types';
import waypointMarkers from './WaypointMarkers';

type LWithMapbox = $Exports<'mapbox.js'>;

type Icons = {
  openWaypointIcon: DivIcon,
  openSelectedWaypointIcon: DivIcon,
  closedWaypointIcon: DivIcon,
  closedSelectedWaypointIcon: DivIcon,
};

// Reactive wrapper around a Marker that responds to visibility and
// hover state.
class SearchMarker {
  marker: Marker;
  icons: Icons;
  map: MapboxMap;
  request: SearchRequest;
  requestSearch: RequestSearch;
  opacityComputed: IComputedValue<number>;
  updateOpacityDisposer: Function;
  updateIconDisposer: Function;

  constructor(L: LWithMapbox, icons: Icons, map: MapboxMap, requestSearch: RequestSearch, opacityComputed: IComputedValue<number>, request: SearchRequest) {
    this.request = request;
    this.icons = icons;
    this.map = map;
    this.requestSearch = requestSearch;
    this.opacityComputed = opacityComputed;

    if (!request.location) {
      throw new Error(`Request ${request.id} did not have a location`);
    }

    this.marker = L.marker({
      lat: request.location.lat,
      lng: request.location.lng,
    }, {
      keyboard: false,
    });

    this.marker.on('click', this.handleClick);
    this.updateOpacityDisposer = autorun('updateOpacity', this.updateOpacity);
    this.updateIconDisposer = autorun('updateIcon', this.updateIcon);
  }

  dispose() {
    this.updateOpacityDisposer();
    this.updateIconDisposer();
    this.map.removeLayer(this.marker);
  }

  @action.bound handleClick() {
    this.requestSearch.selectedRequest = this.request;
    this.requestSearch.selectedSource = 'marker';
  }

  @computed get selected(): boolean {
    return !!this.requestSearch.selectedRequest && this.requestSearch.selectedRequest.id === this.request.id;
  }

  updateIcon = () => {
    let icon;

    if (this.request.status === 'open') {
      if (this.selected) {
        icon = this.icons.openSelectedWaypointIcon;
      } else {
        icon = this.icons.openWaypointIcon;
      }
    } else {
      if (this.selected) {
        icon = this.icons.closedSelectedWaypointIcon;
      } else {
        icon = this.icons.closedWaypointIcon;
      }
    }

    this.marker.setIcon(icon);
    this.marker.setZIndexOffset(this.selected ? 1 : 0);
  }

  updateOpacity = () => {
    const opacity = this.opacityComputed.get();
    this.marker.setOpacity(opacity);

    // we remove the marker from the map if opacity is 0 so it doesn't get
    // clicks
    if (opacity > 0 && !this.map.hasLayer(this.marker)) {
      this.marker.addTo(this.map);
    } else if (opacity === 0 && this.map.hasLayer(this.marker)) {
      this.map.removeLayer(this.marker);
    }
  }
}

export default class SearchMarkerPool {
  L: LWithMapbox;
  map: MapboxMap;
  requestSearch: RequestSearch;
  opacityComputed: IComputedValue<number>;
  icons: Icons;

  maintainMarkersDisposer: Function;
  markers: {[id: string]: SearchMarker} = {};

  constructor(L: LWithMapbox, map: ?MapboxMap, requestSearch: RequestSearch, opacityComputed: IComputedValue<number>) {
    if (!map) {
      throw new Error('SearchMarkerPool initialized without map');
    }

    this.L = L;
    this.map = map;
    this.requestSearch = requestSearch;
    this.opacityComputed = opacityComputed;

    this.icons = {
      openWaypointIcon: L.divIcon(waypointMarkers.greenEmpty),
      openSelectedWaypointIcon: L.divIcon(waypointMarkers.greenFilled),
      closedWaypointIcon: L.divIcon(waypointMarkers.orangeEmpty),
      closedSelectedWaypointIcon: L.divIcon(waypointMarkers.orangeFilled),
    };

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
        newMarkers[request.id] = new SearchMarker(this.L, this.icons, this.map, this.requestSearch, this.opacityComputed, request);
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
