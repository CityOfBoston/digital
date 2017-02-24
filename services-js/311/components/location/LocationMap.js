// @flow

import React from 'react';
import { css } from 'glamor';

// eslint-disable-next-line
import type { Map as GoogleMap, MapsEventListener, Marker, LatLng } from 'google-maps';

import Geocoder from '../../data/external/Geocoder';
import LocationPopUp from './LocationPopUp';

type AutocompleteService = google.maps.places.AutocompleteService;

const CONTAINER_STYLE = css({
  position: 'fixed',
  zIndex: 0,
  width: '100%',
  height: '100%',
});

const MAP_STYLE = css({
  width: '100%',
  height: '100%',
});

const OVERLAY_CONTAINER_STYLE = css({
  position: 'absolute',
  top: 40,
  left: 40,
  background: 'white',
});

export type ExternalProps = {
  active: boolean,
  googleMaps: $Exports<'google-maps'>,
  goToReportForm: () => void,
}

export type ValueProps = {
  googleApiKey: ?string,
  location: ?{| lat: number, lng: number |},
  address: string,
};

export type ActionProps = {
  dispatchLocation: (location: ?{| lat: number, lng: number |}, address: string) => void,
}

export type Props = ExternalProps & ValueProps & ActionProps;

export default class LocationMap extends React.Component {
  props: Props;

  mapEl: ?HTMLElement;
  map: ?GoogleMap;
  mapClickListener: ?MapsEventListener;

  marker: ?Marker;
  markerDragListener: ?MapsEventListener;

  autocompleteService: AutocompleteService;
  geocoder: Geocoder;

  constructor(props: Props) {
    super(props);

    this.geocoder = new Geocoder(props.googleApiKey || '');
    this.autocompleteService = new props.googleMaps.places.AutocompleteService();

    this.mapEl = null;
    this.map = null;
  }

  componentDidMount() {
    this.attachMap();
  }

  componentDidUpdate(oldProps: Props) {
    if (oldProps.active !== this.props.active) {
      const { active, location, address } = this.props;

      if (this.map) {
        this.map.setOptions(this.getMapOptions());
      }

      if (active && location) {
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
  }

  setMapEl = (div: HTMLElement) => {
    this.mapEl = div;
  }

  getMapOptions() {
    const { active, location } = this.props;

    return {
      clickableIcons: false,
      disableDefaultUI: true,
      draggable: active,
      scrollwheel: active,
      scaleControl: true,
      zoomControl: active,
      zoom: 13,
      center: location || {
        lat: 42.346026,
        lng: -71.097279,
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

    if (!map) {
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

    this.props.dispatchLocation(location, address || '');
  }

  whenAddressSearch = async (query: string): Promise<boolean> => {
    const { map, autocompleteService } = this;

    if (!autocompleteService || !map) {
      return false;
    }

    this.props.dispatchLocation(null, '');

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
      this.props.dispatchLocation(location, address);
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

  whenNextClicked = () => {
    const { dispatchLocation, goToReportForm, location, address } = this.props;

    if (!location || !address) {
      throw new Error('Next clicked without location info');
    }

    dispatchLocation(location, address);
    goToReportForm();
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
    const { active } = this.props;

    return (
      <div className={CONTAINER_STYLE}>
        <div className={MAP_STYLE} ref={this.setMapEl} />
        { active && this.renderLocationOverlay() }
      </div>
    );
  }

  renderLocationOverlay() {
    const { address } = this.props;
    return (
      <div className={OVERLAY_CONTAINER_STYLE}>
        <LocationPopUp address={address} addressSearch={this.whenAddressSearch} next={this.whenNextClicked} />
      </div>
    );
  }
}
