// @flow

import React from 'react';
import { css } from 'glamor';
import { observable, computed, action, autorun, runInAction, untracked } from 'mobx';
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

export type Props = {
  mode: MapMode,
  store: AppStore,
  opacityRatio: number,
  // eslint-disable-next-line react/no-unused-prop-types
  loopbackGraphql: LoopbackGraphql,
};

let L: ?LWithMapbox = null;
if (process.browser) {
  L = require('mapbox.js');
}

@observer
export default class LocationMap extends React.Component {
  props: Props;

  mapEl: ?HTMLElement = null;

  @observable.ref mapboxMap: ?MapboxMap = null;
  zoomControl: ?ControlZoom;

  waypointActiveIcon: ?DivIcon;
  waypointInactiveIcon: ?DivIcon;

  requestMarker: ?Marker;
  requestLocationMonitorDisposer: Function;

  @observable pickedLocation: ?{lat: number, lng: number} = null;
  reverseGeocodeDisposer: Function;

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
      });

      requestMarker.on('dragstart', this.handleRequestMarkerDragStart);
      requestMarker.on('dragend', this.handleRequestMarkerDragEnd);
    }

    this.requestLocationMonitorDisposer = autorun('maintainRequestMarkerLocation', this.maintainRequestMarkerLocation);
    this.reverseGeocodeDisposer = autorun('maintainReverseGeocode', this.maintainReverseGeocode);
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

  componentDidUpdate(oldProps: Props) {
    if (oldProps.mode !== this.props.mode) {
      this.updateMapEventHandlers(this.props.mode);
      this.flyToRequestLocation();
    }
  }

  componentWillUnmount() {
    if (this.searchMarkerPool) {
      this.searchMarkerPool.dispose();
    }

    this.requestLocationMonitorDisposer();
    this.reverseGeocodeDisposer();

    if (this.mapboxMap) {
      this.mapboxMap.remove();
    }
  }

  @computed get markerLocation(): ?{ lat: number, lng: number } {
    const { mode, store: { requestForm } } = this.props;
    if (mode === 'picker') {
      return this.pickedLocation || requestForm.locationInfo.location;
    } else {
      return null;
    }
  }

  @computed get isMarkerLocationValid(): boolean {
    const { store: { requestForm } } = this.props;
    return requestForm.locationInfo.address.length > 0;
  }

  maintainRequestMarkerLocation = () => {
    const { requestMarker } = this;

    if (!requestMarker) {
      return;
    }

    if (this.isMarkerLocationValid && this.waypointActiveIcon) {
      requestMarker.setIcon(this.waypointActiveIcon);
    } else if (!this.isMarkerLocationValid && this.waypointInactiveIcon) {
      requestMarker.setIcon(this.waypointInactiveIcon);
    }

    const { mapboxMap: map, markerLocation } = this;

    if (map) {
      if (markerLocation) {
        requestMarker.setLatLng(markerLocation);
        requestMarker.addTo(map);

        const bounds = map.getBounds();
        if (!bounds.contains([markerLocation.lat, markerLocation.lng])) {
          this.flyToRequestLocation();
        }
      } else {
        map.removeLayer(requestMarker);
      }
    }
  }

  maintainReverseGeocode = async () => {
    const { pickedLocation } = this;

    if (pickedLocation) {
      const { loopbackGraphql } = untracked(() => Object.assign({}, this.props));
      const place = await reverseGeocode(loopbackGraphql, pickedLocation);

      runInAction('reverse geocode result', () => {
        const { store: { requestForm: { locationInfo } } } = this.props;

        if (this.pickedLocation === pickedLocation) {
          locationInfo.location = this.pickedLocation;
          this.pickedLocation = null;

          if (place) {
            locationInfo.address = place.address;
          } else {
            locationInfo.address = '';
          }
        }
      });
    }
  }

  flyToRequestLocation() {
    if (this.mapboxMap && this.markerLocation) {
      this.mapboxMap.flyTo(this.markerLocation, 18);
    }
  }

  setMapEl = (mapEl: HTMLElement) => {
    this.mapEl = mapEl;
  }

  @action.bound
  attachMap() {
    const { store, mode } = this.props;

    if (!L) {
      return;
    }

    if (!this.mapEl) {
      throw new Error('mapEl not bound when attaching map');
    }

    const opts = {
      accessToken: store.apiKeys.mapbox,
      center: DEFAULT_CENTER,
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      attributionControl: false,
      maxBounds: MAX_BOUNDS,
      zoomControl: false,
    };

    // In test mode we don't use Mapbox because it requires an API key and
    // tries to load tile sets. We stick to a basic Leaflet map which should
    // still do the things we want to.
    const map = this.mapboxMap = (process.env.NODE_ENV === 'test') ?
      L.map(this.mapEl, (opts: any)) :
      L.mapbox.map(this.mapEl, 'mapbox.streets', opts);
    map.on('click', this.handleMapClick);
    map.on('resize', this.updateMapCenter);
    map.on('moveend', this.updateMapCenter);
    map.on('zoomend', this.updateMapCenter);

    this.updateMapEventHandlers(mode);
    this.updateMapCenter();

    this.flyToRequestLocation();
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

    const neContainerPoint = { x: containerWidth, y: 0 };
    const swContainerPoint = { x: requestSearch.resultsListWidth, y: containerHeight };

    const visibleBounds = L.latLngBounds([]);
    visibleBounds.extend(map.containerPointToLatLng(neContainerPoint));
    visibleBounds.extend(map.containerPointToLatLng(swContainerPoint));

    const visibleCenter = visibleBounds.getCenter();
    const visibleEast = map.containerPointToLatLng({ x: containerWidth, y: containerHeight / 2 });
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

    this.pickedLocation = {
      lat: latLng.lat,
      lng: latLng.lng,
    };
  }

  handleRequestMarkerDragStart = () => {
    if (!this.mapboxMap) {
      return;
    }

    // otherwise a click event will fire on the map
    this.mapboxMap.off('click', this.handleMapClick);
  }

  @action.bound
  handleRequestMarkerDragEnd() {
    if (!this.requestMarker) {
      return;
    }

    const latLng = this.requestMarker.getLatLng();

    this.pickedLocation = {
      lat: latLng.lat,
      lng: latLng.lng,
    };

    window.setTimeout(() => {
      if (this.mapboxMap) {
        this.mapboxMap.on('click', this.handleMapClick);
      }
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
