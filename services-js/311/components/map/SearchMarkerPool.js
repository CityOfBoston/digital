// @flow

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { action, computed, autorun } from 'mobx';
import type { IComputedValue } from 'mobx';
import { css } from 'emotion';
import type { Map as MapboxMap, Marker, DivIcon, Popup } from 'mapbox.js';
import type RequestSearch from '../../data/store/RequestSearch';
import type { SearchCase } from '../../data/types';
import { YELLOW } from '../style-constants';
import waypointMarkers, { WAYPOINT_BASE_OPTIONS } from './WaypointMarkers';
import RequestPopup from './RequestPopup';

type LWithMapbox = $Exports<'mapbox.js'>;

type Icons = {
  openWaypointIcon: DivIcon,
  openSelectedWaypointIcon: DivIcon,
  closedWaypointIcon: DivIcon,
  closedSelectedWaypointIcon: DivIcon,
};

const POPUP_STYLE = css({
  ' .leaflet-popup-content-wrapper': {
    borderRadius: 0,
    border: `2px solid ${YELLOW}`,
    padding: 0,
  },

  ' .leaflet-popup-content': {
    padding: 0,
  },

  ' .leaflet-popup-tip': {
    marginTop: -2,
    borderTopColor: YELLOW,

    ':after': {
      position: 'relative',
      width: 0,
      height: 0,
      top: -11,
      left: -8,
      content: '""',
      display: 'block',
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: '8px solid white',
    },
  },
});

// Reactive wrapper around a Marker that responds to visibility and
// hover state.
class SearchMarker {
  L: LWithMapbox;
  pool: SearchMarkerPool;
  marker: Marker;
  popup: ?Popup;
  icons: Icons;
  map: MapboxMap;
  request: SearchCase;
  requestSearch: RequestSearch;
  opacityComputed: IComputedValue<number>;
  updateOpacityDisposer: Function;
  updateIconDisposer: Function;

  constructor(
    L: LWithMapbox,
    pool: SearchMarkerPool,
    icons: Icons,
    map: MapboxMap,
    requestSearch: RequestSearch,
    opacityComputed: IComputedValue<number>,
    request: SearchCase
  ) {
    this.L = L;
    this.pool = pool;
    this.request = request;
    this.icons = icons;
    this.map = map;
    this.requestSearch = requestSearch;
    this.opacityComputed = opacityComputed;

    if (!request.location) {
      throw new Error(`Request ${request.id} did not have a location`);
    }

    this.marker = L.marker(
      {
        lat: request.location.lat,
        lng: request.location.lng,
      },
      {
        keyboard: false,
      }
    );

    this.marker.on('click', this.handleClick);
    this.updateOpacityDisposer = autorun('updateOpacity', this.updateOpacity);
    this.updateIconDisposer = autorun('updateIcon', this.updateIcon);
  }

  dispose() {
    this.updateOpacityDisposer();
    this.updateIconDisposer();
    this.map.removeLayer(this.marker);
  }

  @action.bound
  handleClick() {
    if (this.pool.clickHandler) {
      this.pool.clickHandler();
    }

    this.requestSearch.selectedRequest = this.request;
    this.requestSearch.selectedSource = 'marker';
  }

  @computed
  get selected(): boolean {
    return (
      !!this.requestSearch.selectedRequest &&
      this.requestSearch.selectedRequest.id === this.request.id
    );
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

    if (this.selected && this.pool.showPopup) {
      if (!this.marker.getPopup()) {
        const popup = this.L.popup({
          closeButton: false,
          offset: [0, -WAYPOINT_BASE_OPTIONS.iconSize.y + 10],
          className: POPUP_STYLE.toString(),
        });

        this.marker.bindPopup(popup);

        const el = document.createElement('DIV');

        if (this.requestSearch.selectedRequest) {
          // hack fix for https://github.com/facebook/flow/issues/4061
          const r: any = render;
          r(
            <RequestPopup caseInfo={this.requestSearch.selectedRequest} />,
            el,
            () => {
              popup.setContent(el);

              // Open after a tick for the case on mobile when you "Back" to this
              // page, the popup's positioning is wrong, likely due to being
              // positioned and then having the map's center / size moved out
              // from under it.
              window.setTimeout(() => {
                this.marker.openPopup();
              }, 0);
            }
          );
        }
      } else {
        this.marker.openPopup();
      }
    } else {
      const popup = this.marker.getPopup();
      if (popup) {
        unmountComponentAtNode(popup.getContent());

        this.marker.closePopup();
        this.marker.unbindPopup();
      }
    }

    this.marker.setIcon(icon);
    this.marker.setZIndexOffset(this.selected ? 1000 : 0);
  };

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
  };
}

export default class SearchMarkerPool {
  L: LWithMapbox;
  map: MapboxMap;
  requestSearch: RequestSearch;
  opacityComputed: IComputedValue<number>;
  icons: Icons;

  maintainMarkersDisposer: Function;
  markers: { [id: string]: SearchMarker } = {};

  showPopup: boolean = false;
  clickHandler: ?Function = null;

  constructor(
    L: LWithMapbox,
    map: ?MapboxMap,
    requestSearch: RequestSearch,
    opacityComputed: IComputedValue<number>,
    showPopup: boolean,
    clickHandler: ?Function
  ) {
    if (!map) {
      throw new Error('SearchMarkerPool initialized without map');
    }

    this.L = L;
    this.map = map;
    this.requestSearch = requestSearch;
    this.opacityComputed = opacityComputed;
    this.showPopup = showPopup;
    this.clickHandler = clickHandler;

    this.icons = {
      openWaypointIcon: L.divIcon(waypointMarkers.greenEmpty),
      openSelectedWaypointIcon: L.divIcon(waypointMarkers.greenFilled),
      closedWaypointIcon: L.divIcon(waypointMarkers.orangeEmpty),
      closedSelectedWaypointIcon: L.divIcon(waypointMarkers.orangeFilled),
    };

    this.maintainMarkersDisposer = autorun(
      'maintainMarkers',
      this.maintainMarkers
    );
  }

  dispose() {
    this.maintainMarkersDisposer();
    Object.keys(this.markers).forEach(id => {
      this.markers[id].dispose();
    });
    this.markers = {};
  }

  setClickHandler(clickHandler: ?Function) {
    this.clickHandler = clickHandler;
  }

  setShowPopup(showPopup: boolean) {
    this.showPopup = showPopup;
  }

  maintainMarkers = () => {
    const newMarkers = {};

    this.requestSearch.results.forEach(request => {
      if (!request.location) {
        return;
      }

      if (this.markers[request.id]) {
        newMarkers[request.id] = this.markers[request.id];
        delete this.markers[request.id];
      } else {
        newMarkers[request.id] = new SearchMarker(
          this.L,
          this,
          this.icons,
          this.map,
          this.requestSearch,
          this.opacityComputed,
          request
        );
      }
    });

    // Anything left in markers is no longer in the search results, so we dispose
    // to pull it from the map and remove watching.
    Object.keys(this.markers).forEach(id => {
      this.markers[id].dispose();
    });

    this.markers = newMarkers;
  };
}
