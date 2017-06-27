// @flow

import 'url-search-params-polyfill';

import React from 'react';
import type { Context } from 'next';
import Router from 'next/router';
import { css } from 'glamor';
import { action, reaction, observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';

import type { RequestAdditions } from '../../server/next-handlers';
import type { AppStore } from '../../data/store';

import makeLoopbackGraphql from '../../data/dao/loopback-graphql';
import type { LoopbackGraphql } from '../../data/dao/loopback-graphql';

import Nav from '../common/Nav';
import { LocationMapWithLibrary } from '../map/LocationMap';
import type LocationMap from '../map/LocationMap';
import {
  HEADER_HEIGHT,
  MEDIA_LARGE,
  IPHONE_FOOTER_HEIGHT,
} from '../style-constants';

import RecentRequests from './RecentRequests';
import RecentRequestsSearchForm from './RecentRequestsSearchForm';

type SearchData = {|
  view: 'search',
  query: string,
  location: ?{| lat: number, lng: number |},
  zoom: ?number,
|};

export type InitialProps = {|
  data: SearchData,
|};

export type Props = {|
  ...InitialProps,
  store: AppStore,
  noMap?: boolean,
|};

const SEARCH_HEIGHT = 62;

// This is the main container for content. We want to be at least full height on
// large screens to push the footer down to where you need to scroll for it.
const CONTAINER_STYLE = css({
  position: 'relative',
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${IPHONE_FOOTER_HEIGHT}px)`,
  paddingTop: SEARCH_HEIGHT,
  display: 'flex',
  flexDirection: 'column',

  [MEDIA_LARGE]: {
    paddingTop: 0,
  },
});

const CONTAINER_FULL_MAP_STYLE = css(CONTAINER_STYLE, {
  height: `calc(100vh - ${HEADER_HEIGHT}px - ${IPHONE_FOOTER_HEIGHT}px)`,
});

const SEARCH_CONTAINER_STYLE = css({
  display: 'block',
  height: SEARCH_HEIGHT,
  width: '100%',
  position: 'fixed',
  top: HEADER_HEIGHT,
  zIndex: 2,
  background: 'white',

  [MEDIA_LARGE]: {
    display: 'none',
  },
});

const MAP_CONTAINER_STYLE = css({
  height: '30vh',
  background: '#9B9B9B',
  position: 'relative',
  zIndex: 0,
  display: 'flex',
  flexDirection: 'column',

  [MEDIA_LARGE]: {
    position: 'fixed',
    right: 0,
    width: '60%',
    minWidth: 'calc(100% - 35rem)',
    top: HEADER_HEIGHT,
    bottom: 0,
    height: 'auto',
  },
});

const FULL_MAP_CONTAINER_STYLE = css(MAP_CONTAINER_STYLE, {
  height: 'auto',
  flex: 1,
});

const MAP_VIEW_BUTTON_CONTAINER_STYLE = css({
  background: 'white',
});

const STICKY_VIEW_BUTTON_STYLE = css({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
});

@observer
export default class SearchLayout extends React.Component {
  static defaultProps = {
    noMap: false,
  };
  props: Props;
  loopbackGraphql: LoopbackGraphql = makeLoopbackGraphql();

  locationUpdateDisposer: ?Function;
  currentLocationMonitorDisposer: ?Function;

  container: ?HTMLElement;
  locationMap: ?LocationMap;
  locationMapContainer: ?HTMLElement;
  @observable mapViewButtonContainer: ?HTMLElement;

  static async getInitialProps({
    query,
  }: Context<RequestAdditions>): Promise<InitialProps> {
    const { lat, lng, zoom } = query;
    let location;

    if (lat && lng) {
      location = {
        lat: parseFloat(query.lat),
        lng: parseFloat(query.lng),
      };
    } else {
      location = null;
    }

    return {
      data: {
        view: 'search',
        query: query.q || '',
        location,
        zoom: zoom ? parseInt(zoom, 10) : null,
      },
    };
  }

  @action
  componentWillMount() {
    const { store, data } = this.props;
    store.requestSearch.query = data.query;

    if (data.location) {
      store.requestSearch.mapCenter = data.location;
    } else {
      store.requestSearch.mapCenter = null;
    }

    if (data.zoom) {
      store.requestSearch.mapZoom = data.zoom;
    } else {
      store.requestSearch.mapZoom = 12;
    }
  }

  @action
  componentDidMount() {
    const { store } = this.props;

    store.requestSearch.start(this.loopbackGraphql);

    // If the browser's location comes in while the map is still in a default
    // view, zoom in to the browser's location.
    this.currentLocationMonitorDisposer = reaction(
      () => ({
        mobile: store.ui.belowMediaLarge,
        browserLocation: store.browserLocation.location,
        inBoston: store.browserLocation.inBoston,
      }),
      ({ mobile, browserLocation, inBoston }) => {
        const mapCenter = store.requestSearch.mapCenter;

        if (!mobile || !inBoston || !browserLocation || !this.locationMap) {
          return;
        }

        if (!mapCenter || !store.requestSearch.mapMoved) {
          this.locationMap.visitLocation(browserLocation, true);
        }
      },
    );

    this.locationUpdateDisposer = reaction(
      () => ({
        resultsQuery: store.requestSearch.resultsQuery,
        location: store.requestSearch.mapCenter,
        zoom: store.requestSearch.mapZoom,
      }),
      ({ resultsQuery, location, zoom }) => {
        const params = new URLSearchParams();

        if (resultsQuery) {
          params.append('q', resultsQuery);
        }

        if (location) {
          params.append('lat', location.lat);
          params.append('lng', location.lng);
        }

        params.append('zoom', zoom);

        const href = `/search?${params.toString()}`;
        Router.push(href, href, { shallow: true });
      },
      {
        name: 'location query updater',
      },
    );
  }

  componentWillUnmount() {
    const { store } = this.props;
    store.requestSearch.stop();

    if (this.locationUpdateDisposer) {
      this.locationUpdateDisposer();
      this.locationUpdateDisposer = null;
    }

    if (this.currentLocationMonitorDisposer) {
      this.currentLocationMonitorDisposer();
      this.currentLocationMonitorDisposer = null;
    }
  }

  setContainer = (container: ?HTMLElement) => {
    this.container = container;
  };

  setLocationMap = (locationMap: ?LocationMap) => {
    this.locationMap = locationMap;
  };

  setLocationMapContainer = (locationMapContainer: ?HTMLElement) => {
    this.locationMapContainer = locationMapContainer;
  };

  @action.bound
  setMapViewButtonContainer(mapViewButtonContainer: ?HTMLElement) {
    this.mapViewButtonContainer = mapViewButtonContainer;
  }

  @action.bound
  switchToListView() {
    const { locationMap } = this;
    const { store: { requestSearch } } = this.props;

    requestSearch.mapView = false;

    if (locationMap) {
      requestSearch.selectedRequest = null;
      requestSearch.selectedSource = null;

      setTimeout(() => {
        locationMap.invalidateSize();
      }, 0);
    }
  }

  @action.bound
  switchToMapView() {
    const { locationMap } = this;
    const { store: { requestSearch } } = this.props;

    requestSearch.mapView = true;
    requestSearch.selectedRequest = null;

    window.scrollTo(0, 0);

    if (locationMap) {
      setTimeout(() => {
        locationMap.invalidateSize();
      }, 0);
    }
  }

  // Returns true if the visitor has scrolled down enough in the list view that
  // the map is hidden. Signal that we should show the "Switch to map view"
  // button.
  @computed
  get mapScrolledOff(): boolean {
    const { store: { ui } } = this.props;
    const { locationMapContainer } = this;

    if (!locationMapContainer) {
      return false;
    }

    return (
      ui.scrollY > -1 &&
      locationMapContainer.getBoundingClientRect().bottom <
        HEADER_HEIGHT + SEARCH_HEIGHT
    );
  }

  // Returns true if the map view button should be sticky. Logic here is that
  // we've scrolled down far enough that the map is visible, but not down to
  // see the bottom of the list, where the statically-positioned button would
  // appear.
  @computed
  get stickyMapViewButton(): boolean {
    const { store: { ui } } = this.props;
    const { container, mapViewButtonContainer } = this;

    if (!container || !mapViewButtonContainer) {
      return false;
    }

    return (
      ui.scrollY > -1 &&
      container.getBoundingClientRect().bottom +
        mapViewButtonContainer.clientHeight >
        ui.visibleHeight + HEADER_HEIGHT
    );
  }

  render() {
    const { store, noMap } = this.props;
    const { ui, requestSearch } = store;
    const { mapScrolledOff, stickyMapViewButton } = this;
    const { mapView } = requestSearch;

    return (
      <div>
        <Head>
          <title>BOS:311 — Public Cases</title>
        </Head>

        <Nav activeSection="search" />

        <div
          className={
            mapView
              ? CONTAINER_FULL_MAP_STYLE.toString()
              : CONTAINER_STYLE.toString()
          }
          style={{ backgroundColor: 'transparent' }}
          role="main">
          <div className={`p-a300 ${SEARCH_CONTAINER_STYLE.toString()}`}>
            <RecentRequestsSearchForm requestSearch={requestSearch} />
          </div>

          <div
            className={mapView ? FULL_MAP_CONTAINER_STYLE : MAP_CONTAINER_STYLE}
            ref={this.setLocationMapContainer}>
            {!noMap &&
              <LocationMapWithLibrary
                locationMapRef={this.setLocationMap}
                store={store}
                mode="requests"
                mobile={ui.belowMediaLarge}
                onMapClick={ui.belowMediaLarge ? this.switchToMapView : null}
              />}
          </div>

          {!mapView &&
            <div ref={this.setContainer}><RecentRequests store={store} /></div>}

          {mapView &&
            <div className="g p-a300">
              <button
                type="button"
                className="btn g--12"
                onClick={this.switchToListView}>
                List View
              </button>
            </div>}

          {!mapView &&
            mapScrolledOff &&
            <div
              className={`g p-a300 ${MAP_VIEW_BUTTON_CONTAINER_STYLE.toString()} ${stickyMapViewButton
                ? STICKY_VIEW_BUTTON_STYLE.toString()
                : ''}`}
              ref={this.setMapViewButtonContainer}>
              <button
                type="button"
                className="btn g--12"
                onClick={this.switchToMapView}>
                Map View
              </button>
            </div>}
        </div>
      </div>
    );
  }
}
