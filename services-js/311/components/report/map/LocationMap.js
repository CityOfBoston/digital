// @flow

import React from 'react';
import { css } from 'glamor';
import { runInAction, computed, action } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import haversine from 'haversine';

// eslint-disable-next-line
import type { Map as GoogleMap, MapsEventListener, Marker, LatLng, MapOptions } from 'google-maps';
import type { AppStore } from '../../../data/store';

import { HEADER_HEIGHT } from '../../style-constants';

import Geocoder from '../../../data/external/Geocoder';
import SearchMarkerPool from './SearchMarkerPool';
import withGoogleMaps from './with-google-maps';

type AutocompleteService = google.maps.places.AutocompleteService;

const CONTAINER_STYLE = css({
  position: 'fixed',
  width: '100%',
  top: HEADER_HEIGHT,
  bottom: 0,
  backgroundColor: '#9B9B9B',
});

const PHONE_STYLE = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const MAP_STYLE = css({
  flex: 1,
  width: '100%',
  height: '100%',
});

export type MapMode = 'disabled' | 'requests' | 'picker';

export type ExternalProps = {
  mode: MapMode,
  setLocationMapSearch: (locationMapSearch: ?(query: string) => Promise<boolean>) => void,
  store: AppStore,
  opacityRatio: number,
}

export type Props = {
  googleMaps: $Exports<'google-maps'>,
} & ExternalProps;

@observer
export default class LocationMap extends React.Component {
  props: Props;

  mapEl: ?HTMLElement;
  map: ?GoogleMap;
  mapClickListener: ?MapsEventListener;

  marker: ?Marker;
  markerDragListener: ?MapsEventListener;

  autocompleteService: AutocompleteService;
  geocoder: Geocoder;

  searchMarkerPool: ?SearchMarkerPool = null;

  constructor(props: Props) {
    super(props);

    const { store, googleMaps } = props;

    this.geocoder = new Geocoder(store.apiKeys.google || '');
    this.autocompleteService = new googleMaps.places.AutocompleteService();

    this.mapEl = null;
    this.map = null;
  }

  componentDidMount() {
    const map = this.attachMap();
    this.props.setLocationMapSearch(this.whenAddressSearch);

    const { googleMaps, store } = this.props;
    this.searchMarkerPool = new SearchMarkerPool(googleMaps.Marker, map, store.requestSearch, computed(() => (
      this.props.mode === 'picker' ? 0 : this.props.opacityRatio
    )));

    this.updateMapCenter();
  }

  componentDidUpdate(oldProps: Props) {
    if (oldProps.mode !== this.props.mode) {
      const { mode, store } = this.props;
      const { location, address } = store.locationInfo;

      if (this.map) {
        this.map.setOptions(this.getMapOptions());
      }

      if (mode === 'picker' && location) {
        this.positionMarker(location, !!address);
      } else {
        this.removeMarker();
      }
    }
  }

  componentWillUnmount() {
    if (this.mapClickListener) {
      this.mapClickListener.remove();
      this.mapClickListener = null;
    }

    this.props.setLocationMapSearch(null);

    if (this.searchMarkerPool) {
      this.searchMarkerPool.dispose();
    }
  }

  setMapEl = (div: HTMLElement) => {
    this.mapEl = div;
  }

  getMapOptions(): MapOptions {
    const { mode } = this.props;
    return {
      clickableIcons: false,
      disableDoubleClickZoom: mode === 'disabled',
      disableDefaultUI: true,
      draggable: mode !== 'disabled',
      gestureHandling: 'greedy',
      scrollwheel: mode === 'picker',
      scaleControl: false,
      zoomControl: mode !== 'disabled',
      minZoom: 11,
    };
  }

  updateMapCenter = debounce(action('updateMapCenter', () => {
    const { map, mapEl } = this;
    if (!map || !mapEl) {
      return;
    }

    const { googleMaps, store: { requestSearch } } = this.props;

    const projection = map.getProjection();
    const scale = 2 ** map.getZoom();
    const bounds = map.getBounds();

    const topRightPoint = projection.fromLatLngToPoint(bounds.getNorthEast());

    const topRightToEdgeOffset = {
      x: 0,
      y: (mapEl.clientHeight / 2) / scale,
    };

    const topRightToCenterOffset = {
      // only right 60% of map is visible when showing results, so take half of
      // that to get the visible center
      x: (-mapEl.clientWidth * 0.3) / scale,
      y: (mapEl.clientHeight / 2) / scale,
    };

    const topRightToBottomLeftOffset = {
      // only right 60% of map is visible when showing results
      x: (-mapEl.clientWidth * 0.6) / scale,
      y: mapEl.clientHeight / scale,
    };

    const edgePoint = new googleMaps.Point(topRightPoint.x + topRightToEdgeOffset.x, topRightPoint.y + topRightToEdgeOffset.y);
    const centerPoint = new googleMaps.Point(topRightPoint.x + topRightToCenterOffset.x, topRightPoint.y + topRightToCenterOffset.y);
    const bottomLeftPoint = new googleMaps.Point(topRightPoint.x + topRightToBottomLeftOffset.x, topRightPoint.y + topRightToBottomLeftOffset.y);

    const edgeLoc = projection.fromPointToLatLng(edgePoint);
    const centerLoc = projection.fromPointToLatLng(centerPoint);

    requestSearch.mapBounds = new googleMaps.LatLngBounds(
      projection.fromPointToLatLng(bottomLeftPoint),
      projection.fromPointToLatLng(topRightPoint));

    requestSearch.mapCenter = {
      lat: centerLoc.lat(),
      lng: centerLoc.lng(),
    };

    requestSearch.radiusKm = haversine({
      latitude: centerLoc.lat(),
      longitude: centerLoc.lng(),
    }, {
      latitude: edgeLoc.lat(),
      longitude: edgeLoc.lng(),
    }, {
      unit: 'km',
    });
  }), 1000)

  attachMap(): GoogleMap {
    if (!this.mapEl) {
      throw new Error('Attaching map without the mapEl being mounted');
    }

    const { store } = this.props;
    const { location } = store.locationInfo;

    const map = new this.props.googleMaps.Map(this.mapEl, {
      ...this.getMapOptions(),
      zoom: 12,
      center: location || {
        lat: 42.326782,
        lng: -71.151948,
      },
    });

    this.mapClickListener = map.addListener('click', (ev) => {
      this.addressChanged(ev.latLng);
    });

    map.addListener('bounds_changed', this.updateMapCenter);

    this.map = map;

    // return convenience to avoid null checks on this.map
    return map;
  }

  addressChanged = async (latLng: LatLng) => {
    const { map } = this;
    const { mode, store } = this.props;

    if (!map || mode !== 'picker') {
      return;
    }

    const marker = this.positionMarker(latLng, false);
    let location = { lat: latLng.lat(), lng: latLng.lng() };

    const { address } = await this.geocoder.address(location) || {};
    if (address) {
      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    } else {
      // Location is outside of Boston
      location = null;
      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/grey.png');
    }

    runInAction('geocode complete', () => {
      store.locationInfo.location = location;
      store.locationInfo.address = address || '';
    });
  }

  whenAddressSearch = async (query: string): Promise<boolean> => {
    const { map, autocompleteService } = this;
    const { store } = this.props;

    if (!autocompleteService || !map) {
      return false;
    }

    runInAction('search start', () => {
      store.locationInfo.location = null;
      store.locationInfo.address = '';
    });

    this.removeMarker();

    const autocompleteRequest = {
      input: query,
      bounds: map.getBounds(),
      types: ['geocode'],
    };

    const predictions = await new Promise((resolve, reject) => {
      autocompleteService.getPlacePredictions(autocompleteRequest, (results, status) => {
        if (status === 'OK') {
          resolve(results || []);
        } else {
          reject(new Error(`Autocomplete prediction error: ${status}`));
        }
      });
    });

    if (predictions.length === 0) {
      return false;
    }

    const placeId = predictions[0].place_id;
    const { address, location } = await this.geocoder.place(placeId) || {};

    if (address && location) {
      runInAction('search complete', () => {
        store.locationInfo.location = location;
        store.locationInfo.address = address;
      });

      this.positionMarker(location, true);

      const projection = map.getProjection();
      const latlng: LatLng = new this.props.googleMaps.LatLng(location);
      const point = projection.fromLatLngToPoint(latlng);
      point.y -= 0.01;
      map.panTo(projection.fromPointToLatLng(point));

      return true;
    } else {
      return false;
    }
  }

  positionMarker(latLng: LatLng | {|lat: number, lng: number|}, inBoston: boolean): Marker {
    const { map } = this;
    let { marker } = this;

    if (!map) {
      throw new Error('Positioning marker without map loaded');
    }

    if (!marker) {
      marker = new this.props.googleMaps.Marker({
        map,
        draggable: true,
        position: latLng,
        icon: inBoston ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/grey.png',
      });

      this.marker = marker;
      this.markerDragListener = marker.addListener('dragend', (ev) => {
        this.addressChanged(ev.latLng);
      });

      return marker;
    } else {
      marker.setPosition(latLng);
      return marker;
    }
  }

  removeMarker() {
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }

    if (this.markerDragListener) {
      this.markerDragListener.remove();
      this.markerDragListener = null;
    }
  }

  render() {
    const { store, mode, opacityRatio } = this.props;
    const { isPhone } = store;

    const opacity = mode !== 'disabled' ? 1 : 0.6 + (0.4 * opacityRatio);

    return (
      <div className={isPhone ? PHONE_STYLE : CONTAINER_STYLE}>
        <div className={MAP_STYLE} style={{ opacity }} ref={this.setMapEl} />
      </div>
    );
  }
}

export const LocationMapWithLib = withGoogleMaps(['places'], ({ store }: ExternalProps) => store.apiKeys.google)(LocationMap);
