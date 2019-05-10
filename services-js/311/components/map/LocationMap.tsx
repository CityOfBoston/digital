import React from 'react';
import { css } from 'emotion';
import { computed, action, reaction } from 'mobx';
import { observer } from 'mobx-react';
import getConfig from 'next/config';
import debounce from 'lodash/debounce';

import { NextConfig } from '../../lib/config';
import Ui from '../../data/store/Ui';
import BrowserLocation from '../../data/store/BrowserLocation';
import AddressSearch from '../../data/store/AddressSearch';
import RequestSearch from '../../data/store/RequestSearch';

import SearchMarkerPool from './SearchMarkerPool';
import waypointMarkers, { preloadWaypointSprite } from './WaypointMarkers';

// mapbox.js / Leaflet on require tries to access window, which doesn't work on
// the server.
import * as MapboxL from 'mapbox.js';

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
const MAX_BOUNDS: MapboxL.LatLngBoundsLiteral = [
  [42.53689200787317, -70.58029174804689],
  [42.115542659613865, -71.7235565185547],
];

export type MapMode = 'inactive' | 'search' | 'picker';

type MapProps = {
  mode: MapMode;
  requestSearch: RequestSearch;
  addressSearch: AddressSearch;
  browserLocation: BrowserLocation;
  ui: Ui;
  mobile: boolean;
  smallPicker?: boolean;
  onMapClick?: Function | null;
};

export type Props = MapProps & {
  L: typeof MapboxL;
};

@observer
export default class LocationMap extends React.Component<Props> {
  static defaultProps = {
    onMapClick: null,
  };

  private mapEl: HTMLElement | null = null;

  private mapboxMap: MapboxL.Map | null = null;
  private zoomControl: MapboxL.Control.Zoom;

  private waypointGreenIcon: MapboxL.DivIcon;
  private waypointOrangeIcon: MapboxL.DivIcon;
  private waypointGrayIcon: MapboxL.DivIcon;

  public locationSearchMarkers: Array<MapboxL.Marker> = [];

  private geocodeMarker: MapboxL.Marker;

  private currentLocationMarker: MapboxL.Marker | null = null;

  private searchMarkerPool: SearchMarkerPool | null = null;
  private mobxDisposers: Array<Function> = [];

  private markerClicked: boolean = false;

  constructor(props: Props) {
    super(props);

    const { L } = this.props;
    this.zoomControl = L.control.zoom({ position: 'topright' });

    this.waypointGreenIcon = L.divIcon(waypointMarkers.greenFilled);
    this.waypointOrangeIcon = L.divIcon(waypointMarkers.orangeFilled);
    this.waypointGrayIcon = L.divIcon(waypointMarkers.grayFilled);

    const currentLocationMarker = (this.currentLocationMarker = L.marker(
      [0, 0],
      {
        icon: L.divIcon(waypointMarkers.currentLocation),
        draggable: false,
        keyboard: false,
        zIndexOffset: 2000,
      }
    ));

    currentLocationMarker.on('click', this
      .handleCurrentLocationMarkerClick as MapboxL.LeafletEventHandlerFn);

    this.geocodeMarker = this.makeLocationSearchMarker(
      L,
      { lat: 0, lng: 0 },
      this.waypointGreenIcon
    );
  }

  private makeLocationSearchMarker(
    L: typeof MapboxL,
    location: { lat: number; lng: number },
    icon: MapboxL.DivIcon,
    n: number | null = null
  ): MapboxL.Marker {
    const marker = L.marker(location, {
      icon: icon || this.waypointGrayIcon,
      draggable: true,
      keyboard: false,
      zIndexOffset: 3000 - (n || 0),
    });

    marker.on('click', this.handleMarkerClick);
    marker.on('dragstart', this
      .handleLocationSearchMarkerDragStart as MapboxL.LeafletEventHandlerFn);
    marker.on('dragend', this.handleLocationSearchMarkerDragEnd);

    return marker;
  }

  componentDidMount() {
    const { L, requestSearch, mode, mobile, onMapClick } = this.props;

    preloadWaypointSprite();

    this.attachMap();

    if (mode === 'picker') {
      this.initLocation(false);
    }

    this.searchMarkerPool = new SearchMarkerPool(
      L,
      this.mapboxMap,
      requestSearch,
      computed(() => (this.props.mode === 'search' ? 1 : 0)),
      mobile,
      onMapClick || null
    );
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
  }

  private updateSearchMarkerPool({ mobile, onMapClick }: Props) {
    const { searchMarkerPool } = this;
    if (!searchMarkerPool) {
      return;
    }

    searchMarkerPool.setClickHandler(onMapClick || null);
    searchMarkerPool.setShowPopup(mobile);
  }

  @action
  private initLocation(animated: boolean) {
    const { addressSearch, browserLocation } = this.props;
    const {
      location: currentLocation,
      inBoston: currentLocationInBoston,
    } = browserLocation;

    if (addressSearch.location) {
      this.visitLocation(addressSearch.location, animated);
    } else if (currentLocation && currentLocationInBoston) {
      // go through selectAddressFromLocation so that we get geocoding
      this.selectAddressFromLocation(currentLocation);
      this.visitLocation(currentLocation, animated);
    }
  }

  @action
  private selectAddressFromLocation(location: { lat: number; lng: number }) {
    const { addressSearch } = this.props;
    addressSearch.location = location;
  }

  visitLocation(location: { lat: number; lng: number }, animated: boolean) {
    const { mobile, ui, addressSearch } = this.props;

    if (!this.mapboxMap) {
      return;
    }

    const map = this.mapboxMap;
    const maxZoom = Math.max(17, map.getZoom());
    const bounds: MapboxL.LatLngBoundsLiteral = [
      [location.lat, location.lng],
      [location.lat, location.lng],
    ];

    const opts: MapboxL.FitBoundsOptions = {
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

  private setMapEl = (mapEl: HTMLElement | null) => {
    this.mapEl = mapEl;
  };

  @action.bound
  private attachMap() {
    const { publicRuntimeConfig }: NextConfig = getConfig();
    const { L, requestSearch, mode } = this.props;
    const { mapboxAccessToken, mapboxStylePath } = publicRuntimeConfig;

    if (!L) {
      return;
    }

    if (!this.mapEl) {
      throw new Error('mapEl not bound when attaching map');
    }

    const style = `mapbox://styles/${mapboxStylePath}`;
    const center = requestSearch.mapCenter;

    let map;

    const opts: MapboxL.MapboxMapOptions = {
      zoom: requestSearch.mapZoom,
      minZoom: 9,
      maxZoom: 18,
      attributionControl: true,
      accessToken: mapboxAccessToken,
      maxBounds: MAX_BOUNDS,
      zoomControl: false,
    };

    if (center) {
      opts.center = center;
    }

    if (!mapboxAccessToken) {
      // In test mode we don't use Mapbox because it requires an API key and
      // tries to load tile sets. We stick to a basic Leaflet map which should
      // still do the things we want to.

      map = L.map(this.mapEl, opts);
    } else {
      map = L.mapbox.map(this.mapEl, null, opts);

      L.mapbox
        .styleLayer(style, {
          accessToken: mapboxAccessToken,
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
          highlightedIndex: this.props.addressSearch.highlightedPlaceIndex,
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
            addressSearch: {
              currentReverseGeocodeLocation,
              currentReverseGeocodeLocationIsValid,
              mode: addressSearchMode,
            },
            mode: mapMode,
          } = this.props;

          return {
            location: currentReverseGeocodeLocation,
            isValid: currentReverseGeocodeLocationIsValid,
            isVisible: addressSearchMode === 'geocode' && mapMode === 'picker',
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
          this.props.addressSearch.mode === 'search'
            ? this.props.addressSearch.location
            : null,
        this.zoomToSelectedLocation,
        {
          name: 'zoomToSelectedLocation',
          fireImmediately: true,
        }
      ),
      reaction(
        () => this.props.browserLocation.location,
        this.maintainCurrentLocationMarker,
        {
          name: 'maintainCurrentLocationMarker',
          fireImmediately: true,
        }
      )
    );
  }

  private calcSearchResultLocations = (): Array<{
    lat: number;
    lng: number;
  }> => {
    const { places, mode } = this.props.addressSearch;

    if (this.props.mode !== 'picker' || mode !== 'search') {
      // don't show any markers
      return [];
    } else {
      return (places || []).map(p => p.location);
    }
  };

  private updatelocationSearchMarkers = ({
    locations,
    highlightedIndex,
  }: {
    locations: Array<{ lat: number; lng: number }>;
    highlightedIndex: number;
  }) => {
    const { L } = this.props;
    const { locationSearchMarkers, mapboxMap } = this;

    if (!mapboxMap) {
      return;
    }

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
  };

  private zoomToMultipleSearchResults = (
    locations: Array<{ lat: number; lng: number }>
  ) => {
    const { mobile, ui, addressSearch } = this.props;
    const { mapboxMap } = this;

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
    }
  };

  private zoomToSelectedLocation = (
    location: { lat: number; lng: number } | null
  ) => {
    if (!location) {
      return;
    }

    this.visitLocation(location, true);
  };

  private maintainGeocodeMarker = ({
    location,
    isValid,
    isVisible,
  }: {
    location: { lat: number; lng: number } | null;
    isValid: boolean;
    isVisible: boolean;
  }): void => {
    const { geocodeMarker, mapboxMap } = this;

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
  };

  private maintainCurrentLocationMarker = (
    currentLocation: false | null | { lat: number; lng: number }
  ) => {
    const { currentLocationMarker, mapboxMap } = this;

    if (mapboxMap && currentLocationMarker) {
      if (currentLocation) {
        currentLocationMarker.setLatLng(currentLocation);
        currentLocationMarker.addTo(mapboxMap);
      } else {
        mapboxMap.removeLayer(currentLocationMarker);
      }
    }
  };

  private updateMapEventHandlers(mode: MapMode) {
    const { smallPicker } = this.props;

    if (!this.mapboxMap) {
      return;
    }

    const map = this.mapboxMap;
    const boxZoom = map.boxZoom;
    const dragPan = map.dragging;
    const doubleClickZoom = map.doubleClickZoom;
    const keyboard = map.keyboard;
    const scrollZoom = map.scrollWheelZoom;
    const touchZoomRotate = map.touchZoom;

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

        break;

      case 'picker':
        boxZoom.enable();
        dragPan.enable();
        doubleClickZoom.enable();
        keyboard.enable();
        scrollZoom.enable();
        touchZoomRotate.enable();

        if (this.zoomControl) {
          if (smallPicker) {
            this.zoomControl.remove();
          } else {
            this.zoomControl.addTo(this.mapboxMap);
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

        if (this.zoomControl) {
          this.zoomControl.addTo(this.mapboxMap);
        }

        break;

      default:
        break;
    }
  }

  private updateMapCenter = debounce(
    action('updateMapCenter', () => {
      const { L, requestSearch } = this.props;
      const { mapboxMap, mapEl } = this;

      if (!mapEl || !mapboxMap) {
        return;
      }

      const containerWidth = mapEl.clientWidth;
      const containerHeight = mapEl.clientHeight;

      const neContainerPoint = L.point({ x: containerWidth, y: 0 });
      const swContainerPoint = L.point({ x: 0, y: containerHeight });

      let centerPoint;
      let mapZoom;

      const visibleBounds = L.latLngBounds([]);
      visibleBounds.extend(mapboxMap.containerPointToLatLng(neContainerPoint));
      visibleBounds.extend(mapboxMap.containerPointToLatLng(swContainerPoint));

      requestSearch.mapBounds = visibleBounds;

      centerPoint = mapboxMap.getCenter();
      mapZoom = mapboxMap.getZoom();

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
  private handleMapClick(ev: MapboxL.LeafletMouseEvent) {
    const { mode, onMapClick } = this.props;
    const { mapboxMap } = this;

    if (onMapClick) {
      onMapClick();
      return;
    }

    if (!mapboxMap) {
      return;
    }

    if (mode === 'picker') {
      const latLng = ev.latlng;

      this.selectAddressFromLocation({
        lat: latLng.lat,
        lng: latLng.lng,
      });
    } else if (mode === 'search') {
      this.markerClicked = false;
      setTimeout(() => {
        if (!this.markerClicked) {
          this.visitLocation(ev.latlng, true);
        }
      }, 0);
    }
  }

  private currentLocationClicked(pos: { lat: number; lng: number }) {
    const { mode } = this.props;
    if (mode === 'picker') {
      this.selectAddressFromLocation(pos);
    } else if (mode === 'search') {
      this.visitLocation(pos, true);
    }
  }

  @action.bound
  private handleCurrentLocationMarkerClick(ev: MapboxL.LeafletMouseEvent) {
    if (ev.originalEvent) {
      ev.originalEvent.stopPropagation();
    }

    // We need to make this a plain object rather than a LatLng instance.
    const { lat, lng } = ev.target.getLatLng();
    this.currentLocationClicked({ lat, lng });
  }

  @action.bound
  private handleMarkerClick(ev: MapboxL.LeafletEvent) {
    if (this.props.mode !== 'picker') {
      return;
    }

    const marker: MapboxL.Marker = ev.target;
    const latLng = marker.getLatLng();

    this.selectAddressFromLocation({
      lat: latLng.lat,
      lng: latLng.lng,
    });
  }

  private handleLocationSearchMarkerDragStart = (
    ev: MapboxL.LeafletMouseEvent
  ) => {
    if (!this.mapboxMap) {
      return;
    }

    const marker: MapboxL.Marker = ev.target;

    // otherwise a click event will fire on the map and the marker when
    // the drag is over
    this.mapboxMap.off('click', this
      .handleMapClick as MapboxL.LeafletEventHandlerFn);
    marker.off('click', this.handleMarkerClick);
  };

  handleLocationSearchMarkerDragEnd = (ev: MapboxL.LeafletEvent) => {
    const marker: MapboxL.Marker = ev.target;
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
      this.mapboxMap.on('click', this
        .handleMapClick as MapboxL.LeafletEventHandlerFn);
      marker.on('click', this.handleMarkerClick);
    }, 0);
  };

  invalidateSize() {
    const { ui } = this.props;

    if (this.mapboxMap) {
      this.mapboxMap.invalidateSize(!ui.reduceMotion);
    }
  }

  render() {
    const { mode, mobile } = this.props;

    const opacity = mode !== 'inactive' ? 1 : 0.6;

    return (
      <div className={MAP_STYLE} style={{ opacity }} ref={this.setMapEl}>
        {mobile && mode === 'picker' && (
          <div className={MOBILE_MARKER_STYLE}>
            <div />
          </div>
        )}
      </div>
    );
  }
}

type MapLoaderProps = MapProps & {
  locationMapRef?: (el: LocationMap | null) => unknown;
};

type MapLoaderState = {
  L: typeof MapboxL | null;
};

const LWithMapboxModule = process.browser
  ? (require('mapbox.js') as typeof MapboxL)
  : null;

export class LocationMapWithLibrary extends React.Component<
  MapLoaderProps,
  MapLoaderState
> {
  static defaultProps: {
    onMapClick: null;
    locationMapRef: null;
  };

  state: MapLoaderState = {
    L: null,
  };

  componentDidMount() {
    // We do this in componentDidMount so that the initial client-side render
    // pass matches the server. (Leaflet can't do any server-side rendering.)
    this.setState({ L: LWithMapboxModule });
  }

  render() {
    const { locationMapRef } = this.props;
    const { L } = this.state;

    if (L) {
      return <LocationMap ref={locationMapRef} L={L} {...this.props} />;
    } else {
      return null;
    }
  }
}
