import 'url-search-params-polyfill';

import React from 'react';
import Router from 'next/router';
import { css } from 'emotion';
import { action, reaction, observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';

import {
  MEDIA_LARGE,
  HEADER_HEIGHT,
  IPHONE_FOOTER_HEIGHT,
  WHITE,
} from '@cityofboston/react-fleet';

import RequestSearch from '../../data/store/RequestSearch';

import FeedbackBanner from '../common/FeedbackBanner';
import Footer from '../common/Footer';
import Nav from '../common/Nav';
import { LocationMapWithLibrary } from '../map/LocationMap';
import LocationMap from '../map/LocationMap';

import RecentRequests from './RecentRequests';
import RecentRequestsSearchForm from './RecentRequestsSearchForm';
import { PageDependencies, GetInitialProps } from '../../pages/_app';
import { getParam } from '@cityofboston/next-client-common';

type SearchData = {
  view: 'search';
  query: string;
  location: { lat: number; lng: number } | null;
  zoom: number | null;
};

export type InitialProps = {
  data: SearchData;
};

export type Props = InitialProps &
  Pick<
    PageDependencies,
    | 'addressSearch'
    | 'ui'
    | 'requestSearch'
    | 'browserLocation'
    | 'fetchGraphql'
  > & {
    noMap: boolean;
  };

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
  background: WHITE,

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
  background: WHITE,
});

const STICKY_VIEW_BUTTON_STYLE = css({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
});

@observer
export default class SearchLayout extends React.Component<Props> {
  static defaultProps = {
    noMap: false,
  };

  private locationUpdateDisposer: Function | null = null;
  private currentLocationMonitorDisposer: Function | null = null;

  // These are all observable because they’re used in @computed methods.
  @observable private container: HTMLElement | null = null;
  @observable private locationMap: LocationMap | null = null;
  @observable private locationMapContainer: HTMLElement | null = null;
  @observable private mapViewButtonContainer: HTMLElement | null = null;

  static getInitialProps: GetInitialProps<InitialProps, 'query'> = async (
    { query },
    _
  ): Promise<InitialProps> => {
    const { lat, lng, zoom } = query;
    let location;

    if (lat && lng) {
      location = {
        lat: parseFloat(getParam(lat)!),
        lng: parseFloat(getParam(lng)!),
      };
    } else {
      location = null;
    }

    return {
      data: {
        view: 'search',
        query: getParam(query.q, ''),
        location,
        zoom: zoom ? parseInt(getParam(zoom)!, 10) : null,
      },
    };
  };

  @action
  componentWillMount() {
    const { requestSearch, data } = this.props;
    requestSearch.query = data.query;

    if (data.location) {
      requestSearch.mapCenter = data.location;
    } else {
      requestSearch.mapCenter = null;
    }

    if (data.zoom) {
      requestSearch.mapZoom = data.zoom;
    } else {
      requestSearch.mapZoom = 12;
    }
  }

  @action
  componentDidMount() {
    const { browserLocation, requestSearch, ui, fetchGraphql } = this.props;

    requestSearch.start(fetchGraphql);

    // If the browser's location comes in while the map is still in a default
    // view, zoom in to the browser's location.
    this.currentLocationMonitorDisposer = reaction(
      () => ({
        mobile: ui.belowMediaLarge,
        browserLocation: browserLocation.location,
        inBoston: browserLocation.inBoston,
      }),
      ({ mobile, browserLocation, inBoston }) => {
        const mapCenter = requestSearch.mapCenter;

        if (!mobile || !inBoston || !browserLocation || !this.locationMap) {
          return;
        }

        if (!mapCenter || !requestSearch.mapMoved) {
          this.locationMap.visitLocation(browserLocation, true);
        }
      }
    );

    this.locationUpdateDisposer = reaction(
      () => ({
        query: requestSearch.query,
        resultsQuery: requestSearch.resultsQuery,
        location: requestSearch.mapCenter,
        zoom: requestSearch.mapZoom,
      }),
      ({ query, resultsQuery, location, zoom }) => {
        const params = new URLSearchParams();
        const caseUrls = RequestSearch.caseUrlsForSearchQuery(query);

        if (caseUrls) {
          Router.push(caseUrls.url, caseUrls.as);
        } else {
          if (resultsQuery) {
            params.append('q', resultsQuery);
          }

          if (location) {
            params.append('lat', location.lat.toString());
            params.append('lng', location.lng.toString());
          }

          params.append('zoom', zoom.toString());

          const href = `/search?${params.toString()}`;
          Router.push(href, href, { shallow: true });
        }
      },
      {
        name: 'location query updater',
        delay: 500,
      }
    );
  }

  componentWillUnmount() {
    const { requestSearch } = this.props;
    requestSearch.stop();

    if (this.locationUpdateDisposer) {
      this.locationUpdateDisposer();
      this.locationUpdateDisposer = null;
    }

    if (this.currentLocationMonitorDisposer) {
      this.currentLocationMonitorDisposer();
      this.currentLocationMonitorDisposer = null;
    }
  }

  @action.bound
  setContainer(container: HTMLElement | null) {
    this.container = container;
  }

  @action.bound
  setLocationMap(locationMap: LocationMap | null) {
    this.locationMap = locationMap;
  }

  @action.bound
  setLocationMapContainer(locationMapContainer: HTMLElement | null) {
    this.locationMapContainer = locationMapContainer;
  }

  @action.bound
  setMapViewButtonContainer(mapViewButtonContainer: HTMLElement | null) {
    this.mapViewButtonContainer = mapViewButtonContainer;
  }

  @action.bound
  switchToListView() {
    const { locationMap } = this;
    const { requestSearch } = this.props;

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
    const { requestSearch } = this.props;

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
    const { ui } = this.props;
    const { locationMapContainer } = this;

    return !!(
      ui.scrollY > -1 &&
      locationMapContainer &&
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
    const { ui } = this.props;
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
    const {
      ui,
      requestSearch,
      browserLocation,
      addressSearch,
      noMap,
    } = this.props;
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
          role="main"
        >
          <div className={`p-a300 ${SEARCH_CONTAINER_STYLE.toString()}`}>
            <RecentRequestsSearchForm requestSearch={requestSearch} />
          </div>

          <div
            className={mapView ? FULL_MAP_CONTAINER_STYLE : MAP_CONTAINER_STYLE}
            ref={this.setLocationMapContainer}
          >
            {!noMap && (
              <LocationMapWithLibrary
                locationMapRef={this.setLocationMap}
                mode="search"
                addressSearch={addressSearch}
                browserLocation={browserLocation}
                requestSearch={requestSearch}
                ui={ui}
                mobile={ui.belowMediaLarge}
                onMapClick={ui.belowMediaLarge ? this.switchToMapView : null}
              />
            )}
          </div>

          {!mapView && (
            <div ref={this.setContainer}>
              <RecentRequests
                requestSearch={requestSearch}
                ui={ui}
                isMobile={ui.belowMediaLarge}
              />
            </div>
          )}

          {mapView && (
            <div className="g p-a300">
              <button
                type="button"
                className="btn g--12"
                onClick={this.switchToListView}
              >
                List View
              </button>
            </div>
          )}

          {!mapView && mapScrolledOff && (
            <div
              className={`g p-a300 ${MAP_VIEW_BUTTON_CONTAINER_STYLE.toString()} ${
                stickyMapViewButton ? STICKY_VIEW_BUTTON_STYLE.toString() : ''
              }`}
              ref={this.setMapViewButtonContainer}
            >
              <button
                type="button"
                className="btn g--12"
                onClick={this.switchToMapView}
              >
                Map View
              </button>
            </div>
          )}
        </div>

        <Footer />
        <FeedbackBanner fit="PAGE" />
      </div>
    );
  }
}
