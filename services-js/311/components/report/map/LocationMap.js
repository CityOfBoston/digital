// @flow

import React from 'react';
import { css } from 'glamor';
import { computed, action, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import type { Map as MapboxMap, ControlZoom, LatLng, DivIcon, Marker } from 'mapbox.js';

import type { AppStore } from '../../../data/store';
import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import reverseGeocode from '../../../data/dao/reverse-geocode';

import SearchMarkerPool from './SearchMarkerPool';
import waypointMarkers from './WaypointMarkers';

const MAP_STYLE = css({
  flex: 1,
  width: '100%',
  height: '100%',
  backgroundColor: '#9B9B9B',
});

const DEFAULT_CENTER = {
  lat: 42.326782,
  lng: -71.151948,
};

const MAX_BOUNDS = [
  [42.53689200787317, -70.58029174804689],
  [42.115542659613865, -71.7235565185547],
];

export type MapMode = 'inactive' | 'requests' | 'picker';

type LWithMapbox = $Exports<'mapbox.js'>;

export type Props = {|
  mode: MapMode,
  store: AppStore,
  opacityRatio: number,
  loopbackGraphql: LoopbackGraphql,
|};

let L: ?LWithMapbox = null;
if (process.browser) {
  L = require('mapbox.js');
}

type MaintainRequestMarkerArgs = {
  // eslint-disable-next-line react/no-unused-prop-types
  markerLocation: ?{lat: number, lng: number},
  // eslint-disable-next-line react/no-unused-prop-types
  isMarkerLocationValid: boolean,
  // eslint-disable-next-line react/no-unused-prop-types
  showMarker: boolean,
};

/**
 * MOBX WARNING!!!!!
 * The props of this component can change regularly, since the opacity comes
 * from the outside.
 *
 * Because of this, it's recommended to use reaction rather than autorun to
 * keep from accidentally reacting to any changes to props.
 */

@observer
export default class LocationMap extends React.Component {
  props: Props;

  mapEl: ?HTMLElement = null;

  mapboxMap: ?MapboxMap = null;
  zoomControl: ?ControlZoom;

  waypointActiveIcon: ?DivIcon;
  waypointInactiveIcon: ?DivIcon;

  requestMarker: ?Marker;
  requestLocationMonitorDisposer: ?Function;

  currentLocationMarker: ?Marker;
  currentLocationMonitorDisposer: ?Function;

  lastPickedLocation: ?{lat: number, lng: number} = null;

  searchMarkerPool: ?SearchMarkerPool = null;

  componentWillMount() {
    if (L) {
      this.zoomControl = L.control.zoom({ position: 'bottomright' });

      this.waypointActiveIcon = L.divIcon(waypointMarkers.orangeFilled);
      this.waypointInactiveIcon = L.divIcon(waypointMarkers.grayFilled);

      const requestMarker = this.requestMarker = L.marker(null, {
        icon: this.waypointInactiveIcon,
        draggable: true,
        keyboard: false,
        zIndexOffset: 3000,
      });

      requestMarker.on('click', this.handleMarkerClick);
      requestMarker.on('dragstart', this.handleRequestMarkerDragStart);
      requestMarker.on('dragend', this.handleRequestMarkerDragEnd);

      const currentLocationMarker = this.currentLocationMarker = L.marker(null, {
        icon: L.divIcon(waypointMarkers.currentLocation),
        draggable: false,
        keyboard: false,
        zIndexOffset: 2000,
      });

      currentLocationMarker.on('click', this.handleMarkerClick);
    }
  }

  componentDidMount() {
    const { store } = this.props;

    this.attachMap();

    if (L) {
      this.searchMarkerPool = new SearchMarkerPool(L, this.mapboxMap, store.requestSearch, computed(() => (
        this.props.mode === 'picker' ? 0 : this.props.opacityRatio
      )));
    }
  }

  @action
  componentDidUpdate(oldProps: Props) {
    const { mode, store } = this.props;
    if (oldProps.mode !== mode) {
      this.updateMapEventHandlers(mode);

      if (mode === 'picker') {
        const currentLocation = store.browserLocation.location;

        if (store.requestForm.locationInfo.location) {
          this.flyToLocation(store.requestForm.locationInfo.location);
        } else if (currentLocation) {
          // go through chooseLocation so that we get geocoding
          this.chooseLocation(currentLocation);
          this.flyToLocation(currentLocation);
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.searchMarkerPool) {
      this.searchMarkerPool.dispose();
    }

    if (this.requestLocationMonitorDisposer) {
      this.requestLocationMonitorDisposer();
    }

    if (this.currentLocationMonitorDisposer) {
      this.currentLocationMonitorDisposer();
    }

    if (this.mapboxMap) {
      this.mapboxMap.remove();
    }
  }

  maintainRequestMarkerLocationData = (): MaintainRequestMarkerArgs => ({
    markerLocation: this.props.store.requestForm.locationInfo.location,
    isMarkerLocationValid: this.props.store.requestForm.locationInfo.address.length > 0,
    showMarker: this.props.mode === 'picker',
  })

  maintainRequestMarkerLocation = ({ isMarkerLocationValid, markerLocation, showMarker }: MaintainRequestMarkerArgs) => {
    const { requestMarker } = this;

    if (!requestMarker) {
      return;
    }

    if (isMarkerLocationValid && this.waypointActiveIcon) {
      requestMarker.setIcon(this.waypointActiveIcon);
    } else if (!isMarkerLocationValid && this.waypointInactiveIcon) {
      requestMarker.setIcon(this.waypointInactiveIcon);
    }

    const { mapboxMap: map, lastPickedLocation } = this;

    if (!map) {
      return;
    }

    if (markerLocation && showMarker) {
      requestMarker.setLatLng(markerLocation);
      requestMarker.addTo(map);

      // zoom to the location if it's not one that we picked by clicking
      if (lastPickedLocation && (lastPickedLocation.lat !== markerLocation.lat || lastPickedLocation.lng !== markerLocation.lng)) {
        this.flyToLocation(markerLocation);
      }
    } else {
      map.removeLayer(requestMarker);
    }
  }

  maintainCurrentLocationMarkerLocation = (currentLocation: ?{lat: number, lng: number}) => {
    const { currentLocationMarker, mapboxMap: map } = this;
    const { mode } = this.props;

    if (!currentLocationMarker) {
      return;
    }

    if (map) {
      if (currentLocation) {
        currentLocationMarker.setLatLng(currentLocation);
        currentLocationMarker.addTo(map);

        if (mode === 'inactive') {
          // we only want to zoom around following the current location if
          // it's not going to disturb the user interacting with the map.
          this.flyToLocation(currentLocation);
        }
      } else {
        map.removeLayer(currentLocationMarker);
      }
    }
  }

  @action
  async chooseLocation(location: {lat: number, lng: number}) {
    const { store, loopbackGraphql } = this.props;

    this.lastPickedLocation = location;
    store.requestForm.locationInfo.location = location;

    const place = await reverseGeocode(loopbackGraphql, location);

    runInAction('reverse geocode result', () => {
      const { store: { requestForm: { locationInfo } } } = this.props;

      if (locationInfo.location && locationInfo.location.lat === location.lat && locationInfo.location.lng === location.lng) {
        if (place) {
          locationInfo.address = place.address;
        } else {
          locationInfo.address = '';
        }
      }
    });
  }

  flyToLocation(location: {lat: number, lng: number}) {
    const { store, mode } = this.props;
    const { mapboxMap: map } = this;

    if (map) {
      map.flyToBounds([[location.lat, location.lng], [location.lat, location.lng]], {
        maxZoom: Math.max(17, map.getZoom()),
        paddingTopLeft: [mode === 'picker' ? 0 : store.requestSearch.resultsListWidth, 0],
      });
    }
  }

  setMapEl = (mapEl: HTMLElement) => {
    this.mapEl = mapEl;
  }

  @action.bound
  attachMap() {
    const { store, mode } = this.props;
    const mapboxKeys = store.apiKeys.mapbox;

    if (!L) {
      return;
    }

    if (!this.mapEl) {
      throw new Error('mapEl not bound when attaching map');
    }

    const opts = {
      accessToken: mapboxKeys.accessToken,
      center: DEFAULT_CENTER,
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      attributionControl: false,
      maxBounds: MAX_BOUNDS,
      zoomControl: false,
    };

    let map;
    if (process.env.NODE_ENV === 'test') {
      // In test mode we don't use Mapbox because it requires an API key and
      // tries to load tile sets. We stick to a basic Leaflet map which should
      // still do the things we want to.

      map = L.map(this.mapEl, (opts: any));
    } else {
      map = L.mapbox.map(this.mapEl, null, opts);
      L.mapbox.styleLayer(mapboxKeys.styleUrl, {
        accessToken: mapboxKeys.accessToken,
      }).addTo(map);
    }

    this.mapboxMap = map;

    map.on('click', this.handleMapClick);
    map.on('resize', this.updateMapCenter);
    map.on('moveend', this.updateMapCenter);
    map.on('zoomend', this.updateMapCenter);

    this.updateMapEventHandlers(mode);
    this.updateMapCenter();

    this.requestLocationMonitorDisposer = reaction(this.maintainRequestMarkerLocationData, this.maintainRequestMarkerLocation, {
      name: 'maintainRequestMarkerLocation',
      fireImmediately: true,
      compareStructural: true,
    });

    this.currentLocationMonitorDisposer = reaction(() => this.props.store.browserLocation.location, this.maintainCurrentLocationMarkerLocation, {
      name: 'maintainCurrentLocationMarkerLocation',
      fireImmediately: true,
    });
  }

  updateMapEventHandlers(mode: MapMode) {
    const map = this.mapboxMap;

    if (!map) {
      return;
    }

    switch (mode) {
      case 'inactive':
        map.boxZoom.disable();
        map.dragging.disable();
        map.doubleClickZoom.disable();
        map.keyboard.disable();
        map.scrollWheelZoom.disable();
        map.touchZoom.disable();

        if (this.zoomControl) {
          this.zoomControl.remove();
        }
        break;

      case 'picker':
        map.boxZoom.enable();
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.keyboard.enable();
        map.scrollWheelZoom.enable();
        map.touchZoom.enable();

        if (this.zoomControl) {
          this.zoomControl.addTo(map);
        }
        break;

      case 'requests':
        map.boxZoom.enable();
        map.doubleClickZoom.enable();
        map.dragging.enable();
        map.keyboard.enable();
        map.scrollWheelZoom.disable();
        map.touchZoom.enable();

        if (this.zoomControl) {
          this.zoomControl.addTo(map);
        }
        break;

      default:
        break;
    }
  }

  updateMapCenter = debounce(action('updateMapCenter', () => {
    const { mapboxMap: map, mapEl } = this;
    if (!map || !mapEl || !L) {
      return;
    }

    const { store: { requestSearch } } = this.props;

    const containerWidth = mapEl.clientWidth;
    const containerHeight = mapEl.clientHeight;

    const neContainerPoint = { x: containerWidth, y: requestSearch.searchHeaderHeight };
    const swContainerPoint = { x: requestSearch.resultsListWidth, y: containerHeight };

    const visibleBounds = L.latLngBounds([]);
    visibleBounds.extend(map.containerPointToLatLng(neContainerPoint));
    visibleBounds.extend(map.containerPointToLatLng(swContainerPoint));

    const visibleCenter = visibleBounds.getCenter();
    const visibleEast = map.containerPointToLatLng({
      x: containerWidth,
      y: neContainerPoint.y + ((swContainerPoint.y - neContainerPoint.y) / 2),
    });
    const visibleRadiusM = Math.abs(visibleCenter.distanceTo(visibleEast));

    requestSearch.mapBounds = visibleBounds;
    requestSearch.mapCenter = {
      lat: visibleCenter.lat,
      lng: visibleCenter.lng,
    };
    requestSearch.radiusKm = visibleRadiusM / 1000;
  }), 500)

  @action.bound
  handleMapClick(ev: Object) {
    const { mode } = this.props;
    const latLng: LatLng = ev.latlng;

    if (mode !== 'picker') {
      return;
    }

    this.chooseLocation({
      lat: latLng.lat,
      lng: latLng.lng,
    });
  }

  @action.bound
  handleMarkerClick(ev: Object) {
    if (this.props.mode !== 'picker') {
      return;
    }

    const marker: Marker = ev.target;
    const latLng = marker.getLatLng();

    this.chooseLocation({
      lat: latLng.lat,
      lng: latLng.lng,
    });
  }

  handleRequestMarkerDragStart = (ev: Object) => {
    if (!this.mapboxMap) {
      return;
    }

    const marker: Marker = ev.target;

    // otherwise a click event will fire on the map and the marker when
    // the drag is over
    this.mapboxMap.off('click', this.handleMapClick);
    marker.off('click', this.handleMarkerClick);
  }

  handleRequestMarkerDragEnd = (ev: Object) => {
    const marker: Marker = ev.target;
    const latLng = marker.getLatLng();

    this.chooseLocation({
      lat: latLng.lat,
      lng: latLng.lng,
    });

    window.setTimeout(() => {
      if (!this.mapboxMap) {
        return;
      }

      // restore the click handlers we turned off when the drag started
      this.mapboxMap.on('click', this.handleMapClick);
      marker.on('click', this.handleMarkerClick);
    }, 0);
  }

  render() {
    const { mode, opacityRatio } = this.props;

    const opacity = mode !== 'inactive' ? 1 : 0.6 + (0.4 * opacityRatio);

    return (
      <div className={MAP_STYLE} style={{ opacity }} ref={this.setMapEl} />
    );
  }
}
