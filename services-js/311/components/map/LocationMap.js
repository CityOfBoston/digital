// @flow
/* eslint react/no-unused-prop-types: 0 */

import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { css } from 'glamor';
import { computed, action, reaction, autorun } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import type { Map as MapboxMap, ControlZoom, DivIcon, Marker } from 'mapbox.js';
import type {
  Map as MapboxGlMap,
  Marker as GLMarker,
  NavigationControl,
  Popup,
  LngLat,
  LngLatBounds,
} from 'mapbox-gl';
import isMapboxGlSupported from 'mapbox-gl-supported';

import type { AppStore } from '../../data/store';

import SearchMarkerPool from './SearchMarkerPool';
import RequestPopup from './RequestPopup';
import waypointMarkers, {
  preloadWaypointSprite,
  WAYPOINT_STYLE,
  WAYPOINT_BASE_OPTIONS,
} from './WaypointMarkers';

const MAP_STYLE = css({
  flex: 1,
  width: '100%',
  height: '100%',
  backgroundColor: '#9B9B9B',
  transition: 'opacity 500ms',
  position: 'relative',
});

const MOBILE_MARKER_STYLE = css({
  position: 'absolute',
  zIndex: 1,
  top: '50%',
  left: '50%',
});

const DEFAULT_NORTH_EAST = {
  lat: 42.2343096,
  lng: -71.18572135,
};

const DEFAULT_SOUTH_WEST = {
  lat: 42.397721,
  lng: -70.9925,
};

export const WAYPOINT_MARKER_CONTAINER_STYLE = css({
  position: 'relative',
  width: 0,
  height: 0,
});

// bounds as lat/lng.  Must convert to lng/lat for mapboxGL
const MAX_BOUNDS = [
  [42.53689200787317, -70.58029174804689],
  [42.115542659613865, -71.7235565185547],
];

export type MapMode = 'inactive' | 'requests' | 'picker';

type LWithMapbox = $Exports<'mapbox.js'>;
type MapboxGL = {
  Marker: GLMarker,
  Map: MapboxGlMap,
  NavigationControl: NavigationControl,
  Popup: Popup,
  LngLat: LngLat,
  LngLatBounds: LngLatBounds,
};

type CommonProps = {|
  mode: MapMode,
  store: AppStore,
  mobile: boolean,
  onMapClick?: ?Function,
|};

// Hack: ESLint is not supporting ...CommonProps in this case
type Props = {|
  mode: MapMode,
  store: AppStore,
  mobile: boolean,
  onMapClick?: ?Function,
  L: ?LWithMapbox,
  mapboxgl: ?MapboxGL,
|};

type DefaultProps = {|
  onMapClick: ?Function,
|};

type MaintainMapLocationMarkerArgs = {
  // eslint-disable-next-line react/no-unused-prop-types
  markerLocation: ?{ lat: number, lng: number },
  // eslint-disable-next-line react/no-unused-prop-types
  isMarkerLocationValid: boolean,
  // eslint-disable-next-line react/no-unused-prop-types
  showMarker: boolean,
};

function makeMarkerGlElement(waypointIcon: Object): HTMLDivElement {
  const el = document.createElement('div');
  el.innerHTML = `<div class="${WAYPOINT_STYLE.toString()}">${waypointIcon.html}</div>`;
  el.className = WAYPOINT_MARKER_CONTAINER_STYLE.toString();
  return el;
}

function setMarkerGlIcon(marker: GLMarker, waypointIcon: Object) {
  const markerEl = marker.getElement();
  if (markerEl && markerEl.firstChild) {
    const childEl = markerEl.firstChild;
    if (childEl instanceof HTMLElement) {
      childEl.innerHTML = waypointIcon.html;
    }
  }
}

@observer
export default class LocationMap extends React.Component<Props> {
  static defaultProps: DefaultProps = {
    onMapClick: null,
  };

  mapEl: ?HTMLElement = null;
  mobileMarkerEl: ?HTMLElement = null;

  mapboxMap: ?MapboxMap = null;
  mapboxGlMap: ?MapboxGlMap = null;
  zoomControl: ?ControlZoom;
  zoomControlGl: ?NavigationControl;

  waypointActiveIcon: ?DivIcon;
  waypointInactiveIcon: ?DivIcon;

  requestMarker: ?Marker;
  requestMarkerGl: ?GLMarker;
  requestLocationMonitorDisposer: ?Function;
  requestMarkerGlDragMouseToPointOffset: ?{ x: number, y: number };

  currentLocationMarker: ?Marker;
  currentLocationMarkerGl: ?GLMarker;
  currentLocationMonitorDisposer: ?Function;

  lastPickedLocation: ?{ lat: number, lng: number } = null;

  searchMarkerPool: ?SearchMarkerPool = null;
  resultsUpdateDisposer: ?Function;

  componentWillMount() {
    const { L, mapboxgl } = this.props;
    if (L) {
      this.zoomControl = L.control.zoom({ position: 'topright' });

      this.waypointActiveIcon = L.divIcon(waypointMarkers.orangeFilled);
      this.waypointInactiveIcon = L.divIcon(waypointMarkers.grayFilled);

      const requestMarker = (this.requestMarker = L.marker(null, {
        icon: this.waypointInactiveIcon,
        draggable: true,
        keyboard: false,
        zIndexOffset: 3000,
      }));

      requestMarker.on('click', this.handleMarkerClick);
      requestMarker.on('dragstart', this.handleRequestMarkerDragStart);
      requestMarker.on('dragend', this.handleRequestMarkerDragEnd);

      const currentLocationMarker = (this.currentLocationMarker = L.marker(
        null,
        {
          icon: L.divIcon(waypointMarkers.currentLocation),
          draggable: false,
          keyboard: false,
          zIndexOffset: 2000,
        }
      ));

      currentLocationMarker.on('click', this.handleCurrentLocationMarkerClick);
    }

    if (mapboxgl) {
      const requestMarkerDiv = makeMarkerGlElement(
        waypointMarkers.orangeFilled
      );
      requestMarkerDiv.style.zIndex = '10';
      requestMarkerDiv.onclick = ev => {
        ev.stopPropagation();
      };
      requestMarkerDiv.onmousedown = this.handleRequestMarkerGlMouseDown;
      this.requestMarkerGl = new mapboxgl.Marker(requestMarkerDiv);

      const currentLocationDiv = makeMarkerGlElement(
        waypointMarkers.currentLocation
      );
      currentLocationDiv.onclick = this.handleCurrentLocationMarkerGlClick;

      this.currentLocationMarkerGl = new mapboxgl.Marker(currentLocationDiv);
    }
  }

  componentDidMount() {
    const { L, store, mode, mobile, onMapClick } = this.props;

    preloadWaypointSprite();

    this.attachMap();

    if (mode === 'picker') {
      this.initLocation(false);
    }

    if (L) {
      this.searchMarkerPool = new SearchMarkerPool(
        L,
        this.mapboxMap,
        store.requestSearch,
        computed(() => (this.props.mode === 'requests' ? 1 : 0)),
        mobile,
        onMapClick
      );
    }
  }

  componentWillReceiveProps(newProps: Props) {
    this.updateSearchMarkerPool(newProps);
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

    if (this.resultsUpdateDisposer) {
      this.resultsUpdateDisposer();
    }

    if (this.mapboxMap) {
      this.mapboxMap.remove();
    }

    if (this.mapboxGlMap) {
      this.mapboxGlMap.remove();
    }

    window.removeEventListener(
      'mousemove',
      this.handleRequestMarkerGlMouseMove
    );
    window.removeEventListener('mouseup', this.handleRequestMarkerGlMouseUp);
  }

  updateSearchMarkerPool({ mobile, onMapClick }: Props) {
    const { searchMarkerPool } = this;
    if (!searchMarkerPool) {
      return;
    }

    searchMarkerPool.setClickHandler(onMapClick);
    searchMarkerPool.setShowPopup(mobile);
  }

  maintainMapLocationMarkerData = (): MaintainMapLocationMarkerArgs => ({
    markerLocation: this.props.store.mapLocation.location,
    isMarkerLocationValid: this.props.store.mapLocation.address.length > 0,
    showMarker: this.props.mode === 'picker',
  });

  maintainRequestMarkerLocation = ({
    isMarkerLocationValid,
    markerLocation,
    showMarker,
  }: MaintainMapLocationMarkerArgs) => {
    const { mobile, store: { ui }, mapboxgl } = this.props;
    const { requestMarker, requestMarkerGl } = this;

    if (isMarkerLocationValid) {
      if (requestMarker && this.waypointActiveIcon) {
        requestMarker.setIcon(this.waypointActiveIcon);
      }

      if (requestMarkerGl) {
        setMarkerGlIcon(requestMarkerGl, waypointMarkers.orangeFilled);
      }
    } else if (!isMarkerLocationValid) {
      if (requestMarker && this.waypointInactiveIcon) {
        requestMarker.setIcon(this.waypointInactiveIcon);
      }

      if (requestMarkerGl) {
        setMarkerGlIcon(requestMarkerGl, waypointMarkers.grayFilled);
      }
    }

    const { mapboxMap, mapboxGlMap, lastPickedLocation, mobileMarkerEl } = this;

    if (markerLocation && showMarker) {
      if (requestMarker) {
        requestMarker.setLatLng(markerLocation);
      }

      if (requestMarkerGl && mapboxgl) {
        requestMarkerGl.setLngLat(
          new mapboxgl.LngLat(markerLocation.lng, markerLocation.lat)
        );
      }

      if (mobile) {
        if (mapboxMap && requestMarker) {
          mapboxMap.removeLayer(requestMarker);
          if (ui.reduceMotion) {
            mapboxMap.setView(markerLocation, mapboxMap.getZoom());
          } else {
            mapboxMap.flyTo(markerLocation);
          }

          if (requestMarker.options.icon) {
            // This is a bit jank but lets us leverage the existing marker-
            // changing code. Alternate plan would be to change the marker icon
            // using React state.
            requestMarker.options.icon.createIcon(this.mobileMarkerEl);
          }
        }

        if (mapboxGlMap && requestMarkerGl) {
          requestMarkerGl.remove();

          if (ui.reduceMotion) {
            mapboxGlMap.panTo([markerLocation.lng, markerLocation.lat]);
          } else {
            mapboxGlMap.flyTo({
              center: [markerLocation.lng, markerLocation.lat],
            });
          }

          if (mobileMarkerEl) {
            mobileMarkerEl.innerHTML = requestMarkerGl.getElement().innerHTML;
          }
        }
      } else {
        if (mapboxMap && requestMarker) {
          requestMarker.addTo(mapboxMap);
        }

        if (mapboxGlMap && requestMarkerGl) {
          requestMarkerGl.addTo(mapboxGlMap);
        }

        // zoom to the location if it's not one that we picked by clicking
        if (
          !lastPickedLocation ||
          (lastPickedLocation &&
            (lastPickedLocation.lat !== markerLocation.lat ||
              lastPickedLocation.lng !== markerLocation.lng))
        ) {
          this.visitLocation(markerLocation, true);
        }
      }
    } else {
      if (mapboxMap && requestMarker) {
        mapboxMap.removeLayer(requestMarker);
      }

      if (requestMarkerGl) {
        requestMarkerGl.remove();
      }
    }
  };

  maintainCurrentLocationMarkerLocation = (
    currentLocation: ?{ lat: number, lng: number }
  ) => {
    const { mapboxgl } = this.props;
    const {
      currentLocationMarker,
      currentLocationMarkerGl,
      mapboxMap,
      mapboxGlMap,
    } = this;

    if (mapboxMap && currentLocationMarker) {
      if (currentLocation) {
        currentLocationMarker.setLatLng(currentLocation);
        currentLocationMarker.addTo(mapboxMap);
      } else {
        mapboxMap.removeLayer(currentLocationMarker);
      }
    }

    if (mapboxGlMap && currentLocationMarkerGl && mapboxgl) {
      if (currentLocation) {
        currentLocationMarkerGl.setLngLat(
          new mapboxgl.LngLat(currentLocation.lng, currentLocation.lat)
        );
        currentLocationMarkerGl.addTo(mapboxGlMap);
      } else {
        currentLocationMarkerGl.remove();
      }
    }
  };

  @action
  initLocation(animated: boolean) {
    const { store } = this.props;
    const {
      location: currentLocation,
      inBoston: currentLocationInBoston,
    } = store.browserLocation;

    if (store.mapLocation.location) {
      this.visitLocation(store.mapLocation.location, animated);
    } else if (currentLocation && currentLocationInBoston) {
      // go through chooseLocation so that we get geocoding
      this.chooseLocation(currentLocation);
      this.visitLocation(currentLocation, animated);
    }
  }

  @action.bound
  chooseLocation(location: {| lat: number, lng: number |}) {
    const { store: { mapLocation } } = this.props;
    const currentLocation = mapLocation.location;

    // compare against epsilon to handle the case where we recenter the map in
    // mobile because of forward address search, and the "map moved" fires and
    // tries to re-geocode based on the newly center point.
    if (
      currentLocation &&
      Math.abs(currentLocation.lat - location.lat) < 0.0000001 &&
      Math.abs(currentLocation.lng - location.lng) < 0.0000001
    ) {
      return;
    }

    this.lastPickedLocation = location;
    mapLocation.geocodeLocation(location);
  }

  visitLocation(location: { lat: number, lng: number }, animated: boolean) {
    const { store } = this.props;

    if (this.mapboxMap) {
      const map = this.mapboxMap;
      const maxZoom = Math.max(17, map.getZoom());
      const bounds = [
        [location.lat, location.lng],
        [location.lat, location.lng],
      ];
      const opts = {
        maxZoom,
      };

      if (animated && !store.ui.reduceMotion) {
        map.flyToBounds(bounds, opts);
      } else {
        map.fitBounds(bounds, opts);
      }
    }

    if (this.mapboxGlMap) {
      const map = this.mapboxGlMap;
      const maxZoom = Math.max(17, map.getZoom());
      const bounds = [
        [location.lng, location.lat],
        [location.lng, location.lat],
      ];
      const opts = {
        maxZoom,
        animate: animated && !store.ui.reduceMotion,
      };

      map.fitBounds(bounds, opts);
    }
  }

  setMapEl = (mapEl: ?HTMLElement) => {
    this.mapEl = mapEl;
  };

  setMobileMarkerEl = (mobileMarkerEl: ?HTMLElement) => {
    this.mobileMarkerEl = mobileMarkerEl;
  };

  @action.bound
  attachMap() {
    const { L, mapboxgl, store, mode } = this.props;
    const { apiKeys, requestSearch } = store;
    const mapboxKeys = apiKeys.mapbox;

    if (!L && !mapboxgl) {
      return;
    }

    if (!this.mapEl) {
      throw new Error('mapEl not bound when attaching map');
    }

    const style = `mapbox://styles/${mapboxKeys.stylePath}`;
    const center = requestSearch.mapCenter;

    const commonOpts = {
      zoom: requestSearch.mapZoom,
      minZoom: 9,
      maxZoom: 18,
      attributionControl: true,
    };

    let map;

    if (L) {
      const opts = {
        ...commonOpts,
        accessToken: mapboxKeys.accessToken,
        maxBounds: MAX_BOUNDS,
        zoomControl: false,
      };

      if (center) {
        opts.center = center;
      }

      if (process.env.NODE_ENV === 'test') {
        // In test mode we don't use Mapbox because it requires an API key and
        // tries to load tile sets. We stick to a basic Leaflet map which should
        // still do the things we want to.

        map = L.map(this.mapEl, (opts: any));
      } else {
        map = L.mapbox.map(this.mapEl, null, opts);

        L.mapbox
          .styleLayer(style, {
            accessToken: mapboxKeys.accessToken,
          })
          .addTo(map);
      }

      if (!center) {
        map.fitBounds(
          [
            [DEFAULT_NORTH_EAST.lat, DEFAULT_NORTH_EAST.lng],
            [DEFAULT_SOUTH_WEST.lat, DEFAULT_SOUTH_WEST.lng],
          ],
          {
            animate: false,
          }
        );
      }

      this.mapboxMap = map;
    } else if (mapboxgl) {
      (mapboxgl: any).accessToken = mapboxKeys.accessToken;
      const opts = {
        container: this.mapEl,
        style,
        maxBounds: new mapboxgl.LngLatBounds(
          [MAX_BOUNDS[1][1], MAX_BOUNDS[1][0]],
          [MAX_BOUNDS[0][1], MAX_BOUNDS[0][0]]
        ),
        ...commonOpts,
      };

      if (center) {
        opts.center = [center.lng, center.lat];
      }

      const mapboxglMap = (map = new mapboxgl.Map(opts));

      if (!center) {
        mapboxglMap.fitBounds(
          [
            [DEFAULT_NORTH_EAST.lng, DEFAULT_NORTH_EAST.lat],
            [DEFAULT_SOUTH_WEST.lng, DEFAULT_SOUTH_WEST.lat],
          ],
          {
            animate: false,
          }
        );
      }

      map.on('load', () => {
        if (mode === 'requests') {
          mapboxglMap.addSource('searchResultsPoints', {
            type: 'geojson',
            data: this.searchResultsGeoJsonData,
          });

          mapboxglMap.addLayer({
            id: 'resultsSearch',
            type: 'symbol',
            source: 'searchResultsPoints',
            layout: {
              'icon-image': '{icon}-waypoint',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-offset': [0, -WAYPOINT_BASE_OPTIONS.iconAnchor.y / 2],
            },
          });

          mapboxglMap.on(
            'click',
            'resultsSearch',
            this.handleResultMarkerClick
          );

          this.resultsUpdateDisposer = autorun('results update', () => {
            const source = mapboxglMap.getSource('searchResultsPoints');
            const data = this.searchResultsGeoJsonData;

            if (source) {
              source.setData(data);
            }
          });
        }
      });

      this.mapboxGlMap = map;
    } else {
      return;
    }

    // happily these event handlers are common between Leaflet and MapboxGL
    map.on('click', this.handleMapClick);
    map.on('resize', this.updateMapCenter);
    map.on('moveend', this.updateMapCenter);
    map.on('zoomend', this.updateMapCenter);

    this.updateMapEventHandlers(mode);
    this.updateMapCenter();

    this.requestLocationMonitorDisposer = reaction(
      this.maintainMapLocationMarkerData,
      this.maintainRequestMarkerLocation,
      {
        name: 'maintainRequestMarkerLocation',
        fireImmediately: true,
        compareStructural: true,
      }
    );

    this.currentLocationMonitorDisposer = reaction(
      () => this.props.store.browserLocation.location,
      this.maintainCurrentLocationMarkerLocation,
      {
        name: 'maintainCurrentLocationMarkerLocation',
        fireImmediately: true,
      }
    );
  }

  @computed
  get searchResultsGeoJsonData(): Object {
    const { store: { requestSearch } } = this.props;

    const iconFn = (status, selected) => {
      if (status === 'open') {
        if (selected) {
          return 'green-filled';
        } else {
          return 'green-empty';
        }
      } else {
        if (selected) {
          return 'orange-filled';
        } else {
          return 'orange-empty';
        }
      }
    };

    return {
      type: 'FeatureCollection',
      features: requestSearch.results.map(res => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [(res.location || {}).lng, (res.location || {}).lat],
        },
        properties: {
          icon: iconFn(res.status, res === requestSearch.selectedRequest),
          requestId: res.id,
        },
      })),
    };
  }

  updateMapEventHandlers(mode: MapMode) {
    const { mapboxgl } = this.props;

    let boxZoom;
    let dragPan;
    let doubleClickZoom;
    let keyboard;
    let scrollZoom;
    let touchZoomRotate;

    if (this.mapboxGlMap) {
      const map = this.mapboxGlMap;
      boxZoom = map.boxZoom;
      dragPan = map.dragPan;
      doubleClickZoom = map.doubleClickZoom;
      keyboard = map.keyboard;
      scrollZoom = map.scrollZoom;
      touchZoomRotate = map.touchZoomRotate;
    } else if (this.mapboxMap) {
      const map = this.mapboxMap;
      boxZoom = map.boxZoom;
      dragPan = map.dragging;
      doubleClickZoom = map.doubleClickZoom;
      keyboard = map.keyboard;
      scrollZoom = map.scrollWheelZoom;
      touchZoomRotate = map.touchZoom;
    } else {
      return;
    }

    switch (mode) {
      case 'inactive':
        boxZoom.disable();
        dragPan.disable();
        doubleClickZoom.disable();
        keyboard.disable();
        scrollZoom.disable();
        touchZoomRotate.disable();

        if (this.zoomControl) {
          this.zoomControl.remove();
        }

        if (this.zoomControlGl && this.mapboxGlMap) {
          this.mapboxGlMap.removeControl(this.zoomControlGl);
          this.zoomControlGl = null;
        }
        break;

      case 'picker':
        boxZoom.enable();
        dragPan.enable();
        doubleClickZoom.enable();
        keyboard.enable();
        scrollZoom.enable();
        touchZoomRotate.enable();

        if (this.zoomControl && this.mapboxMap) {
          this.zoomControl.addTo(this.mapboxMap);
        }

        if (mapboxgl && this.mapboxGlMap) {
          this.zoomControlGl = new mapboxgl.NavigationControl();
          this.mapboxGlMap.addControl(this.zoomControlGl, 'top-right');
        }
        break;

      case 'requests':
        boxZoom.enable();
        doubleClickZoom.enable();
        dragPan.enable();
        keyboard.enable();
        scrollZoom.disable();
        touchZoomRotate.enable();

        if (this.zoomControl && this.mapboxMap) {
          this.zoomControl.addTo(this.mapboxMap);
        }

        if (mapboxgl && this.mapboxGlMap) {
          this.zoomControlGl = new mapboxgl.NavigationControl();
          this.mapboxGlMap.addControl(this.zoomControlGl, 'top-right');
        }
        break;

      default:
        break;
    }
  }

  updateMapCenter = debounce(
    action('updateMapCenter', () => {
      const { L, mapboxgl } = this.props;
      const { mapboxMap, mapEl, mapboxGlMap } = this;

      const { store: { requestSearch }, mobile, mode } = this.props;

      if (!mapEl) {
        return;
      }

      const containerWidth = mapEl.clientWidth;
      const containerHeight = mapEl.clientHeight;

      const neContainerPoint = { x: containerWidth, y: 0 };
      const swContainerPoint = { x: 0, y: containerHeight };

      let centerPoint;
      let mapZoom;

      if (mapboxMap && L) {
        const visibleBounds = L.latLngBounds([]);
        visibleBounds.extend(
          mapboxMap.containerPointToLatLng(neContainerPoint)
        );
        visibleBounds.extend(
          mapboxMap.containerPointToLatLng(swContainerPoint)
        );

        requestSearch.mapBounds = visibleBounds;

        centerPoint = mapboxMap.getCenter();
        mapZoom = mapboxMap.getZoom();
      } else if (mapboxGlMap && mapboxgl) {
        const visibleBounds = new mapboxgl.LngLatBounds();
        visibleBounds.extend(
          mapboxGlMap.unproject([neContainerPoint.x, neContainerPoint.y])
        );
        visibleBounds.extend(
          mapboxGlMap.unproject([swContainerPoint.x, swContainerPoint.y])
        );

        requestSearch.mapBoundsGl = visibleBounds;

        centerPoint = mapboxGlMap.getCenter();
        mapZoom = mapboxGlMap.getZoom();
      } else {
        return;
      }

      const centerStruct = {
        lat: centerPoint.lat,
        lng: centerPoint.lng,
      };

      requestSearch.mapCenter = centerStruct;
      requestSearch.mapZoom = mapZoom;

      if (mode === 'picker' && mobile) {
        this.chooseLocation(centerStruct);
      }
    }),
    500
  );

  @action.bound
  handleMapClick(ev: Object) {
    const { mode, mobile, store: { ui }, onMapClick } = this.props;
    const { mapboxMap, mapboxGlMap } = this;

    if (onMapClick) {
      onMapClick();
      return;
    }

    if (mode !== 'picker') {
      return;
    }

    if (mapboxMap) {
      const latLng = ev.latlng;

      if (mobile) {
        // recentering the map will choose the new location. We do it this way
        // to avoid a double-geocode, first of the clicked location and then
        // to the re-centered map location (they differ by a very fine floating
        // point amount)
        if (ui.reduceMotion) {
          mapboxMap.setView(latLng, mapboxMap.getZoom());
        } else {
          mapboxMap.flyTo(latLng);
        }
      } else {
        this.chooseLocation({
          lat: latLng.lat,
          lng: latLng.lng,
        });
      }
    }

    if (mapboxGlMap) {
      const lngLat = ev.lngLat;

      if (mobile) {
        if (ui.reduceMotion) {
          mapboxGlMap.panTo(lngLat, {
            animate: false,
          });
        } else {
          mapboxGlMap.flyTo({
            center: lngLat,
          });
        }
      } else {
        this.chooseLocation({
          lat: lngLat.lat,
          lng: lngLat.lng,
        });
      }
    }
  }

  currentLocationClicked(pos: {| lat: number, lng: number |}) {
    const { mode } = this.props;
    if (mode === 'picker') {
      this.chooseLocation(pos);
    } else if (mode === 'requests') {
      this.visitLocation(pos, true);
    }
  }

  @action.bound
  handleCurrentLocationMarkerClick(ev: Object) {
    ev.stopPropagation();
    this.currentLocationClicked(ev.target.getLatLng());
  }

  @action.bound
  handleCurrentLocationMarkerGlClick(ev: Object) {
    ev.preventDefault();
    ev.stopPropagation();

    const { currentLocationMarkerGl } = this;

    if (!currentLocationMarkerGl) {
      return;
    }

    const lngLat = currentLocationMarkerGl.getLngLat();
    const pos = {
      lat: lngLat.lat,
      lng: lngLat.lng,
    };
    this.currentLocationClicked(pos);
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

  // MapboxGL doesn't have draggable marker support like Leaflet does, so we
  // have to do it ourselves.
  handleRequestMarkerGlMouseDown = (ev: Object) => {
    ev.stopPropagation();
    ev.preventDefault();

    window.addEventListener('mousemove', this.handleRequestMarkerGlMouseMove);
    window.addEventListener('mouseup', this.handleRequestMarkerGlMouseUp);

    // We keep track of where the mouse is relative to what the marker is
    // actually pointing at, because it's that point that needs to be the
    // ultimate location.
    this.requestMarkerGlDragMouseToPointOffset = {
      x: WAYPOINT_BASE_OPTIONS.iconAnchor.x - ev.offsetX,
      y: WAYPOINT_BASE_OPTIONS.iconAnchor.y - ev.offsetY,
    };
  };

  handleRequestMarkerGlMouseUp = (ev: Object) => {
    window.removeEventListener(
      'mousemove',
      this.handleRequestMarkerGlMouseMove
    );
    window.removeEventListener('mouseup', this.handleRequestMarkerGlMouseUp);

    ev.stopPropagation();
    ev.preventDefault();

    const { requestMarkerGl } = this;
    if (!requestMarkerGl) {
      return;
    }

    const lngLat = requestMarkerGl.getLngLat();

    this.chooseLocation({
      lat: lngLat.lat,
      lng: lngLat.lng,
    });
  };

  handleRequestMarkerGlMouseMove = (ev: MouseEvent) => {
    const {
      mapEl,
      mapboxGlMap,
      requestMarkerGl,
      requestMarkerGlDragMouseToPointOffset,
    } = this;
    if (
      !mapEl ||
      !mapboxGlMap ||
      !requestMarkerGl ||
      !requestMarkerGlDragMouseToPointOffset
    ) {
      return;
    }

    const mapBounds = mapEl.getBoundingClientRect();
    const markerTipPoint = [
      ev.clientX - mapBounds.left + requestMarkerGlDragMouseToPointOffset.x,
      ev.clientY - mapBounds.top + requestMarkerGlDragMouseToPointOffset.y,
    ];

    const lngLat = mapboxGlMap.unproject(markerTipPoint);
    requestMarkerGl.setLngLat(lngLat);
  };

  handleRequestMarkerDragStart = (ev: Object) => {
    if (!this.mapboxMap) {
      return;
    }

    const marker: Marker = ev.target;

    // otherwise a click event will fire on the map and the marker when
    // the drag is over
    this.mapboxMap.off('click', this.handleMapClick);
    marker.off('click', this.handleMarkerClick);
  };

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
  };

  @action
  handleResultMarkerClick = (ev: Object) => {
    const { mapboxGlMap } = this;
    const { mapboxgl, mobile, store: { requestSearch } } = this.props;

    const selectedRequest = requestSearch.results.find(
      res => res.id === ev.features[0].properties.requestId
    );
    requestSearch.selectedRequest = selectedRequest;
    requestSearch.selectedSource = 'marker';

    if (mobile && mapboxgl && mapboxGlMap && selectedRequest) {
      const popup = new mapboxgl.Popup({
        closeButton: false,
        anchor: 'bottom',
        offset: [0, -WAYPOINT_BASE_OPTIONS.iconSize.y - 5],
      });

      const el = document.createElement('DIV');

      popup.on('close', () => {
        unmountComponentAtNode(el);
      });

      popup.setLngLat([
        (selectedRequest.location || {}).lng,
        (selectedRequest.location || {}).lat,
      ]);
      // hack fix for https://github.com/facebook/flow/issues/4061
      const r: any = render;
      r(<RequestPopup caseInfo={selectedRequest} />, el, () => {
        popup.setDOMContent(el);
        popup.addTo(mapboxGlMap);

        // Open after a tick for the case on mobile when you "Back" to this
        // page, the popup's positioning is wrong, likely due to being
        // positioned and then having the map's center / size moved out
        // from under it.
        window.setTimeout(() => {
          // this.marker.openPopup();
        }, 0);
      });
    }
  };

  invalidateSize() {
    const { store: { ui } } = this.props;

    if (this.mapboxMap) {
      this.mapboxMap.invalidateSize(!ui.reduceMotion);
    }

    if (this.mapboxGlMap) {
      this.mapboxGlMap.resize();
    }
  }

  render() {
    const { mode, mobile } = this.props;

    const opacity = mode !== 'inactive' ? 1 : 0.6;

    return (
      <div className={MAP_STYLE} style={{ opacity }} ref={this.setMapEl}>
        {mobile &&
          mode === 'picker' &&
          <div className={MOBILE_MARKER_STYLE}>
            <div ref={this.setMobileMarkerEl} />
          </div>}
      </div>
    );
  }
}

type WithLibraryProps = {|
  ...CommonProps,
  locationMapRef?: ?Function,
|};

type WithLibraryDefaultProps = {|
  ...DefaultProps,
  locationMapRef: ?Function,
|};

export class LocationMapWithLibrary extends React.Component<
  WithLibraryProps,
  {
    L: ?LWithMapbox,
    mapboxgl: ?MapboxGL,
  }
> {
  static defaultProps: WithLibraryDefaultProps = {
    onMapClick: null,
    locationMapRef: null,
  };

  state: {
    L: ?LWithMapbox,
    mapboxgl: ?MapboxGL,
  } = {
    L: null,
    mapboxgl: null,
  };

  componentDidMount() {
    if (process.browser) {
      if (isMapboxGlSupported()) {
        import('mapbox-gl').then((mapboxgl: any) => {
          this.setState({ mapboxgl });
        });
      } else {
        import('mapbox.js').then((L: any) => {
          this.setState({ L });
        });
      }
    }
  }

  render() {
    const { locationMapRef } = this.props;
    const { L, mapboxgl } = this.state;

    if (L || mapboxgl) {
      return (
        <LocationMap
          ref={locationMapRef}
          L={L}
          mapboxgl={mapboxgl}
          {...(this.props: any)}
        />
      );
    } else {
      return null;
    }
  }
}
