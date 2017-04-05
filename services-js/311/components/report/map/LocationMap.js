// @flow

import React from 'react';
import { css } from 'glamor';
import { computed, action, autorun } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import haversine from 'haversine';

// eslint-disable-next-line
import type { Map as GoogleMap, MapsEventListener, Marker, LatLng, MapOptions, LatLngLiteral } from 'google-maps';
import type { AppStore } from '../../../data/store';

import SearchMarkerPool from './SearchMarkerPool';
import { preloadWaypointSprite, closedSelectedWaypointIcon, disabledWaypointIcon } from './WaypointIcons';
import withGoogleMaps from './with-google-maps';

const MAP_STYLE = css({
  flex: 1,
  width: '100%',
  height: '100%',
  backgroundColor: '#9B9B9B',
});

export type MapMode = 'disabled' | 'requests' | 'picker';

export type ExternalProps = {
  mode: MapMode,
  store: AppStore,
  opacityRatio: number,
}

export type Props = {
  googleMaps: $Exports<'google-maps'>,
} & ExternalProps;

@observer
export default class LocationMap extends React.Component {
  props: Props;

  mapEl: ?HTMLElement = null;
  map: ?GoogleMap = null;

  requestMarker: Marker;
  requestLocationMonitorDisposer: Function;

  searchMarkerPool: ?SearchMarkerPool = null;

  componentWillMount() {
    this.requestMarker = new this.props.googleMaps.Marker({
      draggable: true,
    });

    this.requestMarker.addListener('dragend', this.whenRequestLocationChosen);

    this.requestLocationMonitorDisposer = autorun(() => {
      if (this.requestLocationActive) {
        this.requestMarker.setIcon(closedSelectedWaypointIcon);
      } else {
        this.requestMarker.setIcon(disabledWaypointIcon);
      }

      if (this.requestLocation) {
        this.requestMarker.setPosition(this.requestLocation);
        this.requestMarker.setMap(this.map);
      } else {
        this.requestMarker.setMap(null);
      }
    });
  }

  componentDidMount() {
    preloadWaypointSprite();

    const map = this.attachMap();

    const { googleMaps, store } = this.props;
    this.searchMarkerPool = new SearchMarkerPool(googleMaps.Marker, map, store.requestSearch, computed(() => (
      this.props.mode === 'picker' ? 0 : this.props.opacityRatio
    )));

    this.updateMapCenter();
  }

  componentDidUpdate(oldProps: Props) {
    if (oldProps.mode !== this.props.mode) {
      if (this.map) {
        this.map.setOptions(this.getMapOptions());
      }
    }
  }

  componentWillUnmount() {
    if (this.searchMarkerPool) {
      this.searchMarkerPool.dispose();
    }

    this.requestLocationMonitorDisposer();
  }

  @computed get requestLocation(): ?LatLngLiteral {
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

    const { store: { requestForm } } = this.props;
    const { location } = requestForm.locationInfo;

    const map = new this.props.googleMaps.Map(this.mapEl, {
      ...this.getMapOptions(),
      zoom: 12,
      center: location || {
        lat: 42.326782,
        lng: -71.151948,
      },
    });

    map.addListener('click', this.whenRequestLocationChosen);
    map.addListener('bounds_changed', this.updateMapCenter);

    this.map = map;

    // return convenience to avoid null checks on this.map
    return map;
  }

  @action.bound
  whenRequestLocationChosen(ev: Object) {
    const { mode, store: { requestForm } } = this.props;
    const latLng: LatLng = ev.latLng;

    if (mode !== 'picker') {
      return;
    }

    requestForm.locationInfo.location = {
      lat: latLng.lat(),
      lng: latLng.lng(),
    };
    requestForm.locationInfo.address = '';
  }

  render() {
    const { mode, opacityRatio } = this.props;

    const opacity = mode !== 'disabled' ? 1 : 0.6 + (0.4 * opacityRatio);

    return (
      <div className={MAP_STYLE} style={{ opacity }} ref={this.setMapEl} />
    );
  }
}

export const LocationMapWithLib = withGoogleMaps(['places'], ({ store }: ExternalProps) => store.apiKeys.google)(LocationMap);
