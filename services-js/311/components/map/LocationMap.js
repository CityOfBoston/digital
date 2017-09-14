// @flow
/* eslint react/no-unused-prop-types: 0 */

import React from 'react';
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

import type { AppStore } from '../../data/store';

import SearchMarkerPool from './SearchMarkerPool';
import RequestPopup from './RequestPopup';
import waypointMarkers, {
  preloadWaypointSprite,
  WAYPOINT_STYLE,
  WAYPOINT_NUMBER_STYLE,
  WAYPOINT_BASE_OPTIONS,
} from './WaypointMarkers';

// mapbox.js / Leaflet on require tries to access window, which doesn't work on
// the server.
const L = process.browser ? require('mapbox.js') : null;

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

const DEFAULT_SOUTH_WEST = {
  lat: 42.2343096,
  lng: -71.18572135,
};

const DEFAULT_NORTH_EAST = {
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

export type MapMode = 'inactive' | 'search' | 'picker';

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
  smallPicker?: boolean,
  onMapClick?: ?Function,
|};

// Hack: ESLint is not supporting ...CommonProps in this case
type Props = {|
  mode: MapMode,
  store: AppStore,
  mobile: boolean,
  smallPicker?: boolean,
  onMapClick?: ?Function,
  L: ?LWithMapbox,
  mapboxgl: ?MapboxGL,
|};

type DefaultProps = {|
  onMapClick: ?Function,
|};

function makeMarkerGlElement(
  waypointIcon: Object,
  number?: ?number
): HTMLDivElement {
  const el = document.createElement('div');

  const numberHtml = number
    ? `<div class="t--sans ${WAYPOINT_NUMBER_STYLE.toString()}">${number}</div>`
    : '';

  el.innerHTML = `<div class="${WAYPOINT_STYLE.toString()}">${waypointIcon.html}${numberHtml}</div>`;
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

  waypointGreenIcon: DivIcon;
  waypointOrangeIcon: DivIcon;
  waypointGrayIcon: DivIcon;

  locationSearchMarkers: Array<Marker> = [];
  locationSearchMarkersGl: Array<GLMarker> = [];

  draggingMarkerGl: ?GLMarker;
  draggingMarkerGlDragMouseToPointOffset: ?{ x: number, y: number };

  geocodeMarker: ?Marker;
  geocodeMarkerGl: ?GLMarker;

  currentLocationMarker: ?Marker;
  currentLocationMarkerGl: ?GLMarker;

  searchMarkerPool: ?SearchMarkerPool = null;

  mobxDisposers: Array<Function> = [];

  markerClicked: boolean = false;

  makeLocationSearchMarker(
    L: any,
    location: ?{ lat: number, lng: number },
    icon: ?DivIcon,
    number?: ?number
  ): Marker {
    const marker = L.marker(location, {
      icon: icon || this.waypointGrayIcon,
      draggable: true,
      keyboard: false,
      zIndexOffset: 3000 - (number || 0),
    });

    marker.on('click', this.handleMarkerClick);
    marker.on('dragstart', this.handleLocationSearchMarkerDragStart);
    marker.on('dragend', this.handleLocationSearchMarkerDragEnd);

    return marker;
  }

  makeLocationSearchMarkerGl(
    mapboxgl: any,
    location: ?{ lat: number, lng: number },
    icon: ?Object,
    number?: ?number
  ): GLMarker {
    const markerDiv = makeMarkerGlElement(
      icon || waypointMarkers.orangeFilled,
      number
    );

    markerDiv.style.zIndex = '10';

    markerDiv.onclick = ev => {
      ev.stopPropagation();
    };

    const marker = new mapboxgl.Marker(markerDiv);

    markerDiv.onmousedown = this.handleLocationSearchMarkerGlMouseDown.bind(
      this,
      marker
    );

    if (location) {
      marker.setLngLat(new mapboxgl.LngLat(location.lng, location.lat));
    }

    return marker;
  }

  componentWillMount() {
    const { L, mapboxgl } = this.props;
    if (L) {
      this.zoomControl = L.control.zoom({ position: 'topright' });

      this.waypointGreenIcon = L.divIcon(waypointMarkers.greenFilled);
      this.waypointOrangeIcon = L.divIcon(waypointMarkers.orangeFilled);
      this.waypointGrayIcon = L.divIcon(waypointMarkers.grayFilled);

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

      this.geocodeMarker = this.makeLocationSearchMarker(
        L,
        null,
        this.waypointGreenIcon
      );
    }

    if (mapboxgl) {
      const currentLocationDiv = makeMarkerGlElement(
        waypointMarkers.currentLocation
      );
      currentLocationDiv.onclick = this.handleCurrentLocationMarkerGlClick;

      this.currentLocationMarkerGl = new mapboxgl.Marker(currentLocationDiv);

      this.geocodeMarkerGl = this.makeLocationSearchMarkerGl(
        mapboxgl,
        null,
        waypointMarkers.greenFilled
      );
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
        computed(() => (this.props.mode === 'search' ? 1 : 0)),
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
    const { mode, smallPicker } = this.props;

    if (oldProps.mode !== mode) {
      this.updateMapEventHandlers(mode);

      if (mode === 'picker') {
        this.initLocation(true);
      }
    } else if (oldProps.smallPicker !== smallPicker) {
      this.updateMapEventHandlers(mode);
      // we need this to be long enough for the LocationPopUp height transition
      // to run.
      window.setTimeout(() => this.invalidateSize(), 220);
    }
  }

  componentWillUnmount() {
    this.mobxDisposers.forEach(d => d());

    if (this.searchMarkerPool) {
      this.searchMarkerPool.dispose();
    }

    if (this.mapboxMap) {
      this.mapboxMap.remove();
    }

    if (this.mapboxGlMap) {
      this.mapboxGlMap.remove();
    }

    window.removeEventListener(
      'mousemove',
      this.handleLocationSearchMarkerGlMouseMove
    );
    window.removeEventListener(
      'mouseup',
      this.handleLocationSearchMarkerGlMouseUp
    );
  }

  updateSearchMarkerPool({ mobile, onMapClick }: Props) {
    const { searchMarkerPool } = this;
    if (!searchMarkerPool) {
      return;
    }

    searchMarkerPool.setClickHandler(onMapClick);
    searchMarkerPool.setShowPopup(mobile);
  }

  @action
  initLocation(animated: boolean) {
    const { store } = this.props;
    const {
      location: currentLocation,
      inBoston: currentLocationInBoston,
    } = store.browserLocation;

    if (store.addressSearch.location) {
      this.visitLocation(store.addressSearch.location, animated);
    } else if (currentLocation && currentLocationInBoston) {
      // go through selectAddressFromLocation so that we get geocoding
      this.selectAddressFromLocation(currentLocation);
      this.visitLocation(currentLocation, animated);
    }
  }

  @action
  selectAddressFromLocation(location: {| lat: number, lng: number |}) {
    const { store: { addressSearch } } = this.props;
    addressSearch.location = location;
  }

  visitLocation(location: { lat: number, lng: number }, animated: boolean) {
    const { mobile, store: { ui, addressSearch } } = this.props;

    if (this.mapboxMap) {
      const map = this.mapboxMap;
      const maxZoom = Math.max(17, map.getZoom());
      const bounds = [
        [location.lat, location.lng],
        [location.lat, location.lng],
      ];
      const opts = {
        maxZoom,
        paddingTopLeft: mobile
          ? [0, 0]
          : [addressSearch.searchPopupWidth || 0 + 40, 60],
        paddingBottomRight: mobile
          ? [0, 0]
          : // Need to leave some room for zoom controls
            [60, 40],
      };

      if (animated && !ui.reduceMotion) {
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
        animate: animated && !ui.reduceMotion,
        padding: mobile
          ? 40
          : {
              top: 60,
              bottom: 40,
              left: (addressSearch.searchPopupWidth || 0) / 3 + 40,
              // Need to leave some room for zoom controls
              right: 60,
            },
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
            [DEFAULT_SOUTH_WEST.lat, DEFAULT_SOUTH_WEST.lng],
            [DEFAULT_NORTH_EAST.lat, DEFAULT_NORTH_EAST.lng],
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
            [DEFAULT_SOUTH_WEST.lng, DEFAULT_SOUTH_WEST.lat],
            [DEFAULT_NORTH_EAST.lng, DEFAULT_NORTH_EAST.lat],
          ],
          {
            animate: false,
          }
        );
      }

      map.on('load', () => {
        if (mode === 'search') {
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

          this.mobxDisposers.push(
            autorun('results update', () => {
              const source = mapboxglMap.getSource('searchResultsPoints');
              const data = this.searchResultsGeoJsonData;

              if (source) {
                source.setData(data);
              }
            })
          );
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

    this.mobxDisposers.push(
      reaction(
        () => ({
          locations: this.calcSearchResultLocations(),
          highlightedIndex: this.props.store.addressSearch
            .highlightedPlaceIndex,
        }),
        this.updatelocationSearchMarkers,
        {
          name: 'updatelocationSearchMarkers',
          fireImmediately: true,
        }
      ),
      reaction(
        this.calcSearchResultLocations,
        this.zoomToMultipleSearchResults,
        {
          name: 'zoomToMultipleSearchResults',
          fireImmediately: true,
        }
      ),
      reaction(
        () => {
          const {
            currentReverseGeocodeLocation,
            currentReverseGeocodeLocationIsValid,
            mode,
          } = this.props.store.addressSearch;

          return {
            location: currentReverseGeocodeLocation,
            isValid: currentReverseGeocodeLocationIsValid,
            isVisible: mode === 'geocode',
          };
        },
        this.maintainGeocodeMarker,
        {
          name: 'maintainGeocodeMarker',
          fireImmediately: true,
        }
      ),
      reaction(
        () =>
          this.props.store.addressSearch.mode === 'search'
            ? this.props.store.addressSearch.location
            : null,
        this.zoomToSelectedLocation,
        {
          name: 'zoomToSelectedLocation',
          fireImmediately: true,
        }
      ),
      reaction(
        () => this.props.store.browserLocation.location,
        this.maintainCurrentLocationMarker,
        {
          name: 'maintainCurrentLocationMarker',
          fireImmediately: true,
        }
      )
    );
  }

  calcSearchResultLocations = (): Array<{ lat: number, lng: number }> => {
    const { places, mode } = this.props.store.addressSearch;

    if (this.props.mode !== 'picker' || mode !== 'search') {
      // don't show any markers
      return [];
    } else {
      return (places || []).map(p => p.location);
    }
  };

  updatelocationSearchMarkers = ({
    locations,
    highlightedIndex,
  }: {
    locations: Array<{ lat: number, lng: number }>,
    highlightedIndex: number,
  }) => {
    const { mapboxgl, L } = this.props;
    const {
      locationSearchMarkers,
      locationSearchMarkersGl,
      mapboxMap,
      mapboxGlMap,
    } = this;

    if (mapboxMap) {
      locationSearchMarkers.forEach(m => mapboxMap.removeLayer(m));

      this.locationSearchMarkers = locations.map((location, idx) => {
        const marker = this.makeLocationSearchMarker(
          L,
          location,
          idx === highlightedIndex
            ? this.waypointGreenIcon
            : this.waypointOrangeIcon,
          idx + 1
        );

        marker.addTo(mapboxMap);

        return marker;
      });
    }

    if (mapboxGlMap) {
      locationSearchMarkersGl.forEach(m => m.remove());

      this.locationSearchMarkersGl = locations.map((location, idx) => {
        const marker = this.makeLocationSearchMarkerGl(
          mapboxgl,
          location,
          idx === highlightedIndex
            ? waypointMarkers.greenFilled
            : waypointMarkers.orangeFilled,
          idx + 1
        );

        marker.placeIndex = idx;

        return marker;
      });

      // We add backwards so that the first ones appear on top.
      this.locationSearchMarkersGl.reduceRight((prev, marker) => {
        marker.addTo(mapboxGlMap);
      }, null);
    }
  };

  zoomToMultipleSearchResults = (
    locations: Array<{ lat: number, lng: number }>
  ) => {
    const { mobile, store: { ui, addressSearch } } = this.props;
    const { mapboxMap, mapboxGlMap } = this;

    // Only zoom-to-fit if there is more than one location. Note that this
    // check also prevents colliding with the zoom for when a single result is
    // auto-selected, as well as clicking on the map.
    if (locations.length > 1 && addressSearch.currentPlaceIndex === -1) {
      const lngs = locations.map(l => l.lng);
      const lats = locations.map(l => l.lat);

      if (mapboxMap) {
        mapboxMap.fitBounds(
          [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)],
          ],
          {
            animate: !ui.reduceMotion,
            paddingTopLeft: mobile
              ? [0, 0]
              : [60, addressSearch.searchPopupWidth || 0 + 40],
            paddingBottomRight: mobile
              ? [0, 0]
              : // Need to leave some room for zoom controls
                [40, 60],
          }
        );
      }

      if (mapboxGlMap) {
        mapboxGlMap.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          {
            animate: !ui.reduceMotion,
            padding: mobile
              ? 0
              : {
                  top: 60,
                  bottom: 40,
                  left: addressSearch.searchPopupWidth || 0 + 40,
                  // Need to leave some room for zoom controls
                  right: 60,
                },
          }
        );
      }
    }
  };

  zoomToSelectedLocation = (location: ?{ lat: number, lng: number }) => {
    if (!location) {
      return;
    }

    this.visitLocation(location, true);
  };

  maintainGeocodeMarker = ({
    location,
    isValid,
    isVisible,
  }: {
    location: ?{ lat: number, lng: number },
    isValid: boolean,
    isVisible: boolean,
  }): void => {
    const { mapboxgl } = this.props;
    const { geocodeMarker, geocodeMarkerGl, mapboxMap, mapboxGlMap } = this;

    if (mapboxMap && geocodeMarker) {
      if (location && isVisible) {
        geocodeMarker.setLatLng(location);
        geocodeMarker.addTo(mapboxMap);
        geocodeMarker.setIcon(
          isValid ? this.waypointGreenIcon : this.waypointGrayIcon
        );
      } else {
        mapboxMap.removeLayer(geocodeMarker);
      }
    }

    if (mapboxGlMap && geocodeMarkerGl && mapboxgl) {
      if (location && isVisible) {
        geocodeMarkerGl.setLngLat(
          new mapboxgl.LngLat(location.lng, location.lat)
        );
        setMarkerGlIcon(
          geocodeMarkerGl,
          isValid ? waypointMarkers.greenFilled : waypointMarkers.grayFilled
        );
        geocodeMarkerGl.addTo(mapboxGlMap);
      } else {
        geocodeMarkerGl.remove();
      }
    }
  };

  maintainCurrentLocationMarker = (
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

    const features = requestSearch.results.map(res => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [(res.location || {}).lng, (res.location || {}).lat],
      },
      properties: {
        icon: iconFn(res.status, res === requestSearch.selectedRequest),
        requestId: res.id,
        selected: res === requestSearch.selectedRequest,
      },
    }));

    // puts the selected feature first so that it renders on top
    features.sort((a, b) => {
      if (a.properties.selected) {
        return -1;
      } else if (b.properties.selected) {
        return 1;
      } else {
        return 0;
      }
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  updateMapEventHandlers(mode: MapMode) {
    const { mapboxgl, smallPicker } = this.props;

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
          if (smallPicker) {
            this.zoomControl.remove();
          } else {
            this.zoomControl.addTo(this.mapboxMap);
          }
        }

        if (mapboxgl && this.mapboxGlMap) {
          if (smallPicker) {
            if (this.zoomControlGl) {
              this.mapboxGlMap.removeControl(this.zoomControlGl);
              this.zoomControlGl = null;
            }
          } else {
            if (!this.zoomControlGl) {
              this.zoomControlGl = new mapboxgl.NavigationControl();
              this.mapboxGlMap.addControl(this.zoomControlGl, 'top-right');
            }
          }
        }
        break;

      case 'search':
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

      const { store: { requestSearch } } = this.props;

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
    }),
    500
  );

  @action.bound
  handleMapClick(ev: Object) {
    const { mode, onMapClick } = this.props;
    const { mapboxMap, mapboxGlMap } = this;

    if (onMapClick) {
      onMapClick();
      return;
    }

    if (mode === 'picker') {
      if (mapboxMap) {
        const latLng = ev.latlng;

        this.selectAddressFromLocation({
          lat: latLng.lat,
          lng: latLng.lng,
        });
      }

      if (mapboxGlMap) {
        const lngLat = ev.lngLat;

        this.selectAddressFromLocation({
          lat: lngLat.lat,
          lng: lngLat.lng,
        });
      }
    } else if (mode === 'search') {
      this.markerClicked = false;
      setTimeout(() => {
        if (!this.markerClicked) {
          this.visitLocation(ev.latlng || ev.lngLat, true);
        }
      }, 0);
    }
  }

  currentLocationClicked(pos: {| lat: number, lng: number |}) {
    const { mode } = this.props;
    if (mode === 'picker') {
      this.selectAddressFromLocation(pos);
    } else if (mode === 'search') {
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

    this.selectAddressFromLocation({
      lat: latLng.lat,
      lng: latLng.lng,
    });
  }

  // MapboxGL doesn't have draggable marker support like Leaflet does, so we
  // have to do it ourselves.
  handleLocationSearchMarkerGlMouseDown = (marker: GLMarker, ev: Object) => {
    ev.stopPropagation();
    ev.preventDefault();

    this.draggingMarkerGl = marker;

    window.addEventListener(
      'mousemove',
      this.handleLocationSearchMarkerGlMouseMove
    );
    window.addEventListener(
      'mouseup',
      this.handleLocationSearchMarkerGlMouseUp
    );

    // We keep track of where the mouse is relative to what the marker is
    // actually pointing at, because it's that point that needs to be the
    // ultimate location.
    this.draggingMarkerGlDragMouseToPointOffset = {
      x: WAYPOINT_BASE_OPTIONS.iconAnchor.x - ev.offsetX,
      y: WAYPOINT_BASE_OPTIONS.iconAnchor.y - ev.offsetY,
    };
  };

  @action.bound
  handleLocationSearchMarkerGlMouseUp(ev: Object) {
    window.removeEventListener(
      'mousemove',
      this.handleLocationSearchMarkerGlMouseMove
    );
    window.removeEventListener(
      'mouseup',
      this.handleLocationSearchMarkerGlMouseUp
    );

    ev.stopPropagation();
    ev.preventDefault();

    const { draggingMarkerGl } = this;
    const { addressSearch } = this.props.store;

    if (!draggingMarkerGl) {
      return;
    }

    this.draggingMarkerGl = null;

    const lngLat = draggingMarkerGl.getLngLat();

    if (draggingMarkerGl.hasOwnProperty('placeIndex')) {
      addressSearch.currentPlaceIndex = draggingMarkerGl.placeIndex;
      addressSearch.highlightedPlaceIndex = draggingMarkerGl.placeIndex;
    } else {
      this.selectAddressFromLocation({
        lat: lngLat.lat,
        lng: lngLat.lng,
      });
    }
  }

  handleLocationSearchMarkerGlMouseMove = (ev: MouseEvent) => {
    const {
      mapEl,
      mapboxGlMap,
      draggingMarkerGl,
      draggingMarkerGlDragMouseToPointOffset,
    } = this;
    if (
      !mapEl ||
      !mapboxGlMap ||
      !draggingMarkerGl ||
      !draggingMarkerGlDragMouseToPointOffset
    ) {
      return;
    }

    if (draggingMarkerGl.hasOwnProperty('placeIndex')) {
      delete draggingMarkerGl.placeIndex;
    }

    const mapBounds = mapEl.getBoundingClientRect();
    const markerTipPoint = [
      ev.clientX - mapBounds.left + draggingMarkerGlDragMouseToPointOffset.x,
      ev.clientY - mapBounds.top + draggingMarkerGlDragMouseToPointOffset.y,
    ];

    const lngLat = mapboxGlMap.unproject(markerTipPoint);
    draggingMarkerGl.setLngLat(lngLat);
  };

  handleLocationSearchMarkerDragStart = (ev: Object) => {
    if (!this.mapboxMap) {
      return;
    }

    const marker: Marker = ev.target;

    // otherwise a click event will fire on the map and the marker when
    // the drag is over
    this.mapboxMap.off('click', this.handleMapClick);
    marker.off('click', this.handleMarkerClick);
  };

  handleLocationSearchMarkerDragEnd = (ev: Object) => {
    const marker: Marker = ev.target;
    const latLng = marker.getLatLng();

    this.selectAddressFromLocation({
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

    // MapboxGL doesn't have a way to prevent marker clicks from keeping map
    // clicks from happening.
    this.markerClicked = true;

    if (ev.originalEvent && ev.originalEvent.stopPropagation) {
      ev.originalEvent.stopPropagation();
    }

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
    // We do this in componentDidMount so that the initial client-side render
    // pass matches the server. (Leaflet can't do any server-side rendering.)
    this.setState({ L });
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
