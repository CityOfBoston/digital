// @flow

import React from 'react';
import { css } from 'glamor';
import { runInAction, autorun, untracked, computed, extras, action } from 'mobx';
import { observer } from 'mobx-react';

// eslint-disable-next-line
import type { Map as GoogleMap, MapsEventListener, Marker, LatLng, MapOptions } from 'google-maps';
import type { AppStore } from '../../../data/store';
import type { SearchRequest } from '../../../data/types';

import { HEADER_HEIGHT } from '../../style-constants';

import Geocoder from '../../../data/external/Geocoder';
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

export type ExternalProps = {
  mode: 'disabled' | 'requests' | 'picker',
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

  updateSearchResultMarkersDisposer: ?Function;

  constructor(props: Props) {
    super(props);

    const { store, googleMaps } = props;

    this.geocoder = new Geocoder(store.apiKeys.google || '');
    this.autocompleteService = new googleMaps.places.AutocompleteService();

    this.mapEl = null;
    this.map = null;
  }

  componentDidMount() {
    this.attachMap();
    this.props.setLocationMapSearch(this.whenAddressSearch);

    this.updateSearchResultMarkersDisposer = autorun('updateSearchResultMarkers', this.updateSearchResultMarkers);
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

    if (this.updateSearchResultMarkersDisposer) {
      this.updateSearchResultMarkersDisposer();
    }
  }

  setMapEl = (div: HTMLElement) => {
    this.mapEl = div;
  }

  // Pulled out as a computed property so that placeSearchResultMarkers doesn't
  // depend directly on this.props.
  @computed get showRecentRequestsMarkers(): boolean {
    const { mode } = this.props;
    return mode === 'requests';
  }

  getMapOptions(): MapOptions {
    const { mode, store } = this.props;
    const { location } = store.locationInfo;

    return {
      clickableIcons: false,
      disableDoubleClickZoom: true,
      disableDefaultUI: true,
      draggable: mode !== 'disabled',
      gestureHandling: 'greedy',
      scrollwheel: mode === 'picker',
      scaleControl: false,
      zoomControl: mode !== 'disabled',
      zoom: 12,
      center: location || {
        lat: 42.326782,
        lng: -71.151948,
      },
    };
  }

  attachMap() {
    if (!this.mapEl) {
      // eslint-disable-next-line no-console
      console.warn('Attaching map without the mapEl being mounted');
      return;
    }

    this.map = new this.props.googleMaps.Map(this.mapEl, this.getMapOptions());
    this.mapClickListener = this.map.addListener('click', (ev) => {
      this.addressChanged(ev.latLng);
    });
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

  @computed get searchResultMarkers(): google.maps.Marker[] {
    // We need untracked so that this helper doesn't develop a dependency on
    // all props directly, because then it will be triggered for any prop
    // change, even for ones it never references.
    //
    // Specifically, the opacityRatio prop changes quickly when scrolling.
    const { store, googleMaps } = untracked(() => Object.assign({}, this.props));

    const lastMarkers: ?(google.maps.Marker[]) = extras.getAtom(this, 'searchResultMarkers').value;
    if (lastMarkers) {
      lastMarkers.forEach((m) => { m.setMap(null); });
    }

    const markers = [];
    store.requestSearch.results.forEach((r) => {
      if (!r.location) {
        return;
      }

      const marker = new googleMaps.Marker({
        position: {
          lat: r.location.lat,
          lng: r.location.lng,
        },
      });
      marker.addListener('click', this.handleSearchResultMarkerClick.bind(this, r));
      marker.request = r;
      markers.push(marker);
    });

    return markers;
  }

  updateSearchResultMarkers = () => {
    const { mode, store } = this.props;
    const { selectedRequest } = store.requestSearch;

    const map = (mode === 'requests' ? this.map : null);

    this.searchResultMarkers.forEach((m) => {
      if (!(m.request instanceof Object)) {
        return;
      }

      const selected = selectedRequest === m.request;

      let icon;
      if (m.request.status === 'open') {
        if (selected) {
          icon = '/static/img/waypoint-open-selected.png';
        } else {
          icon = '/static/img/waypoint-open.png';
        }
      } else {
        if (selected) {
          icon = '/static/img/waypoint-closed-selected.png';
        } else {
          icon = '/static/img/waypoint-closed.png';
        }
      }

      if (m.getIcon() !== icon) {
        m.setIcon(icon);
      }

      const zIndex = selected ? 1 : 0;
      if (m.getZIndex() !== zIndex) {
        m.setZIndex(zIndex);
      }

      if (m.getMap() !== map) {
        if (!map) {
          m.setMap(map);
        } else {
          window.setTimeout(() => { m.setMap(map); }, Math.random() * 500);
        }
      }
    });
  }

  @action.bound
  handleSearchResultMarkerClick(request: SearchRequest) {
    const { store: { requestSearch } } = this.props;
    requestSearch.selectedRequest = request;
    requestSearch.selectedSource = 'map';
  }

  render() {
    const { store, mode, opacityRatio } = this.props;
    const { isPhone } = store;

    const opacity = mode !== 'inactive' ? 1 : 0.6 + (0.4 * opacityRatio);

    return (
      <div className={isPhone ? PHONE_STYLE : CONTAINER_STYLE}>
        <div className={MAP_STYLE} style={{ opacity }} ref={this.setMapEl} />
      </div>
    );
  }
}

export const LocationMapWithLib = withGoogleMaps(['places'], ({ store }: ExternalProps) => store.apiKeys.google)(LocationMap);
