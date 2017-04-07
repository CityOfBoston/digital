// @flow

import React from 'react';
import { css } from 'glamor';
import { observable, computed, action, autorun } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import type { Map as MapboxMap, ControlZoom, LatLng, Icon, Marker } from 'mapbox.js';

import type { AppStore } from '../../../data/store';

import SearchMarkerPool from './SearchMarkerPool';
import withMapbox from './with-mapbox';

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
  [42.19620169472614, -71.37998785400623],
  [42.48347020269986, -70.80801214599518],
];

const WAYPOINT_ICON_SIZE = [39, 51];
const WAYPOINT_ANCHOR_POINT = [20, 53];

export type MapMode = 'inactive' | 'requests' | 'picker';

type LWithMapbox = $Exports<'mapbox.js'>;

export type Props = {
  L: LWithMapbox,
  mode: MapMode,
  store: AppStore,
  opacityRatio: number,
};

@observer
export default class LocationMap extends React.Component {
  props: Props;

  mapEl: ?HTMLElement = null;

  @observable.ref mapboxMap: ?MapboxMap = null;
  zoomControl: ControlZoom;

  waypointActiveIcon: Icon;
  waypointInactiveIcon: Icon;

  requestMarker: Marker;
  requestLocationMonitorDisposer: Function;

  searchMarkerPool: ?SearchMarkerPool = null;

  componentWillMount() {
    const { L } = this.props;
    this.zoomControl = L.control.zoom({ position: 'bottomright' });
    this.waypointActiveIcon = L.icon({
      iconUrl: '/static/img/waypoint-orange-filled.png',
      iconSize: WAYPOINT_ICON_SIZE,
      iconAnchor: WAYPOINT_ANCHOR_POINT,
    });
    this.waypointInactiveIcon = L.icon({
      iconUrl: '/static/img/waypoint-gray-filled.png',
      iconSize: WAYPOINT_ICON_SIZE,
      iconAnchor: WAYPOINT_ANCHOR_POINT,
    });

    this.requestMarker = L.marker(null, {
      draggable: true,
      keyboard: false,
    });

    this.requestMarker.on('dragend', this.handleRequestMarkerDrag);

    this.requestLocationMonitorDisposer = autorun(() => {
      if (this.requestLocationActive) {
        this.requestMarker.setIcon(this.waypointActiveIcon);
      } else {
        this.requestMarker.setIcon(this.waypointInactiveIcon);
      }

      const { mapboxMap: map, requestLocation } = this;

      if (map) {
        if (requestLocation) {
          this.requestMarker.setLatLng(requestLocation);
          this.requestMarker.addTo(map);

          const bounds = map.getBounds();
          if (!bounds.contains([requestLocation.lat, requestLocation.lng])) {
            map.flyTo(requestLocation, 16);
          }
        } else {
          map.removeLayer(this.requestMarker);
        }
      }
    });
  }

  componentDidMount() {
    this.attachMap();

    const { L, store } = this.props;
    this.searchMarkerPool = new SearchMarkerPool(L, this.mapboxMap, store.requestSearch, computed(() => (
      this.props.mode === 'picker' ? 0 : this.props.opacityRatio
    )));
  }

  componentDidUpdate(oldProps: Props) {
    if (oldProps.mode !== this.props.mode) {
      this.updateMapEventHandlers(this.props.mode);
    }
  }

  componentWillUnmount() {
    if (this.searchMarkerPool) {
      this.searchMarkerPool.dispose();
    }

    this.requestLocationMonitorDisposer();
  }

  @computed get requestLocation(): ?{ lat: number, lng: number } {
    const { mode, store: { requestForm } } = this.props;
    if (mode === 'picker') {
      return requestForm.locationInfo.location;
    } else {
      return null;
    }
  }

  @computed get requestLocationActive(): boolean {
    const { store: { requestForm } } = this.props;
    return requestForm.locationInfo.address.length > 0;
  }

  setMapEl = (mapEl: HTMLElement) => {
    this.mapEl = mapEl;
  }

  @action.bound
  attachMap() {
    const { L, store, mode } = this.props;

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

    const map = this.mapboxMap = L.mapbox.map(this.mapEl, 'mapbox.streets', opts);
    map.on('click', this.handleMapClick);
    map.on('resize', this.updateMapCenter);
    map.on('moveend', this.updateMapCenter);
    map.on('zoomend', this.updateMapCenter);

    this.updateMapEventHandlers(mode);
    this.updateMapCenter();
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

        this.zoomControl.remove();
        break;

      case 'picker':
        map.boxZoom.enable();
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.keyboard.enable();
        map.scrollWheelZoom.enable();
        map.touchZoom.enable();

        this.zoomControl.addTo(map);
        break;

      case 'requests':
        map.boxZoom.enable();
        map.doubleClickZoom.enable();
        map.dragging.enable();
        map.keyboard.enable();
        map.scrollWheelZoom.disable();
        map.touchZoom.enable();

        this.zoomControl.addTo(map);
        break;

      default:
        break;
    }
  }

  updateMapCenter = debounce(action('updateMapCenter', () => {
    const { mapboxMap: map, mapEl } = this;
    if (!map || !mapEl) {
      return;
    }

    const { L, store: { requestSearch } } = this.props;

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
    const { mode, store: { requestForm } } = this.props;
    const latLng: LatLng = ev.latlng;

    if (mode !== 'picker') {
      return;
    }

    requestForm.locationInfo.location = {
      lat: latLng.lat,
      lng: latLng.lng,
    };
    requestForm.locationInfo.address = '';
  }

  @action.bound
  handleRequestMarkerDrag() {
    const { store: { requestForm } } = this.props;
    const latLng = this.requestMarker.getLatLng();

    requestForm.locationInfo.location = {
      lat: latLng.lat,
      lng: latLng.lng,
    };
    requestForm.locationInfo.address = '';
  }

  render() {
    const { mode, opacityRatio } = this.props;

    const opacity = mode !== 'inactive' ? 1 : 0.6 + (0.4 * opacityRatio);

    return (
      <div className={MAP_STYLE} style={{ opacity }} ref={this.setMapEl} />
    );
  }
}

export const LocationMapWithLib = withMapbox()(LocationMap);
