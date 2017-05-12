// @flow

import React from 'react';
import { css } from 'glamor';
import { computed, action, reaction } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import type { Map as MapboxMap, ControlZoom, LatLng, DivIcon, Marker } from 'mapbox.js';

import type { AppStore } from '../../data/store';

import SearchMarkerPool from './SearchMarkerPool';
import waypointMarkers, { preloadWaypointSprite } from './WaypointMarkers';

const MAP_STYLE = css({
  flex: 1,
  width: '100%',
  height: '100%',
  backgroundColor: '#9B9B9B',
  transition: 'opacity 500ms',
});

const MOBILE_MARKER_STYLE = css({
  position: 'absolute',
  zIndex: 1,
  top: '50%',
  left: '50%',
});

const DEFAULT_CENTER = {
  lat: 42.326782,
  lng: -71.151948,
};

const DEFAULT_MOBILE_CENTER = {
  lat: 42.34117523670304,
  lng: -71.06319129467012,
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
  mobile: boolean,
|};

let L: ?LWithMapbox = null;
if (process.browser) {
  L = require('mapbox.js');
}

type MaintainMapLocationMarkerArgs = {
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
  mobileMarkerEl: ?HTMLElement = null;

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

      currentLocationMarker.on('click', this.handleCurrentLocationMarkerClick);
    }
  }

  componentDidMount() {
    const { store, mode } = this.props;

    preloadWaypointSprite();

    this.attachMap();

    if (mode === 'picker') {
      this.initLocation(false);
    }

    if (L) {
      this.searchMarkerPool = new SearchMarkerPool(L, this.mapboxMap, store.requestSearch, computed(() => (
        this.props.mode === 'requests' ? 1 : 0
      )));
    }
  }

  @action
  componentDidUpdate(oldProps: Props) {
    const { mode } = this.props;
    if (oldProps.mode !== mode) {
      this.updateMapEventHandlers(mode);

      if (mode === 'picker') {
        this.initLocation(true);
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

  maintainMapLocationMarkerData = (): MaintainMapLocationMarkerArgs => ({
    markerLocation: this.props.store.mapLocation.location,
    isMarkerLocationValid: this.props.store.mapLocation.address.length > 0,
    showMarker: this.props.mode === 'picker',
  })

  maintainRequestMarkerLocation = ({ isMarkerLocationValid, markerLocation, showMarker }: MaintainMapLocationMarkerArgs) => {
    const { mobile, store: { ui } } = this.props;
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

      if (mobile) {
        map.removeLayer(requestMarker);
        if (ui.reduceMotion) {
          map.setView(markerLocation, map.getZoom());
        } else {
          map.flyTo(markerLocation);
        }

        if (requestMarker.options.icon) {
          // This is a bit jank but lets us leverage the existing marker-
          // changing code. Alternate plan would be to change the marker icon
          // using React state.
          requestMarker.options.icon.createIcon(this.mobileMarkerEl);
        }
      } else {
        requestMarker.addTo(map);

        // zoom to the location if it's not one that we picked by clicking
        if (lastPickedLocation && (lastPickedLocation.lat !== markerLocation.lat || lastPickedLocation.lng !== markerLocation.lng)) {
          this.visitLocation(markerLocation, true);
        }
      }
    } else {
      map.removeLayer(requestMarker);
    }
  }

  maintainCurrentLocationMarkerLocation = (currentLocation: ?{lat: number, lng: number}) => {
    const { currentLocationMarker, mapboxMap: map } = this;

    if (!currentLocationMarker) {
      return;
    }

    if (map) {
      if (currentLocation) {
        currentLocationMarker.setLatLng(currentLocation);
        currentLocationMarker.addTo(map);
      } else {
        map.removeLayer(currentLocationMarker);
      }
    }
  }

  @action
  initLocation(animated: boolean) {
    const { store } = this.props;
    const { location: currentLocation, inBoston: currentLocationInBoston } = store.browserLocation;

    if (store.mapLocation.location) {
      this.visitLocation(store.mapLocation.location, animated);
    } else if (currentLocation && currentLocationInBoston) {
      // go through chooseLocation so that we get geocoding
      this.chooseLocation(currentLocation);
      this.visitLocation(currentLocation, animated);
    }
  }

  @action.bound
  chooseLocation(location: {lat: number, lng: number}) {
    const { store: { mapLocation } } = this.props;
    this.lastPickedLocation = location;
    mapLocation.geocodeLocation(location);
  }

  visitLocation(location: {lat: number, lng: number}, animated: boolean) {
    const { store, mode } = this.props;
    const { mapboxMap: map } = this;

    if (map) {
      const bounds = [[location.lat, location.lng], [location.lat, location.lng]];
      const opts = {
        maxZoom: Math.max(17, map.getZoom()),
        paddingTopLeft: [mode === 'picker' ? 0 : store.requestSearch.resultsListWidth, 0],
      };

      if (animated && !store.ui.reduceMotion) {
        map.flyToBounds(bounds, opts);
      } else {
        map.fitBounds(bounds, opts);
      }
    }
  }

  setMapEl = (mapEl: HTMLElement) => {
    this.mapEl = mapEl;
  }

  setMobileMarkerEl = (mobileMarkerEl: ?HTMLElement) => {
    this.mobileMarkerEl = mobileMarkerEl;
  }

  @action.bound
  attachMap() {
    const { store, mode, mobile } = this.props;
    const { apiKeys, requestSearch } = store;
    const mapboxKeys = apiKeys.mapbox;

    if (!L) {
      return;
    }

    if (!this.mapEl) {
      throw new Error('mapEl not bound when attaching map');
    }

    const opts = {
      accessToken: mapboxKeys.accessToken,
      center: requestSearch.mapCenter || (mobile ? DEFAULT_MOBILE_CENTER : DEFAULT_CENTER),
      zoom: requestSearch.mapZoom,
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
      L.mapbox.styleLayer(`mapbox://styles/${mapboxKeys.stylePath}`, {
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

    this.requestLocationMonitorDisposer = reaction(this.maintainMapLocationMarkerData, this.maintainRequestMarkerLocation, {
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

    const { store: { requestSearch }, mobile } = this.props;

    const containerWidth = mapEl.clientWidth;
    const containerHeight = mapEl.clientHeight;

    const neContainerPoint = { x: containerWidth, y: 0 };
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
    requestSearch.searchCenter = {
      lat: visibleCenter.lat,
      lng: visibleCenter.lng,
    };

    const centerPoint = map.getCenter();
    const centerStruct = {
      lat: centerPoint.lat,
      lng: centerPoint.lng,
    };
    requestSearch.mapCenter = centerStruct;
    requestSearch.mapZoom = map.getZoom();
    requestSearch.radiusKm = visibleRadiusM / 1000;

    if (mobile) {
      this.chooseLocation(centerStruct);
    }
  }), 500)

  @action.bound
  handleMapClick(ev: Object) {
    const { mode, mobile, store: { ui } } = this.props;
    const latLng: LatLng = ev.latlng;

    if (mode !== 'picker') {
      return;
    }

    if (mobile) {
      if (this.mapboxMap) {
        // recentering the map will choose the new location. We do it this way
        // to avoid a double-geocode, first of the clicked location and then
        // to the re-centered map location (they differ by a very fine floating
        // point amount)
        if (ui.reduceMotion) {
          this.mapboxMap.setView(latLng, this.mapboxMap.getZoom());
        } else {
          this.mapboxMap.flyTo(latLng);
        }
      }
    } else {
      this.chooseLocation({
        lat: latLng.lat,
        lng: latLng.lng,
      });
    }
  }

  @action.bound
  handleCurrentLocationMarkerClick(ev: Object) {
    const { mode } = this.props;
    if (mode === 'picker') {
      this.handleMarkerClick(ev);
    } else if (mode === 'requests') {
      this.visitLocation(ev.target.getLatLng(), true);
    }
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
    const { mode, mobile } = this.props;

    const opacity = mode !== 'inactive' ? 1 : 0.6;

    return (
      <div className={MAP_STYLE} style={{ opacity }} ref={this.setMapEl}>
        { mobile && <div className={MOBILE_MARKER_STYLE}><div ref={this.setMobileMarkerEl} /></div> }
      </div>
    );
  }
}
