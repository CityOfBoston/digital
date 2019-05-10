import React from 'react';
import { css } from 'emotion';
import Router from 'next/router';
import { observer } from 'mobx-react';

import { NextContext } from '@cityofboston/next-client-common';
import { HEADER_HEIGHT } from '@cityofboston/react-fleet';

import FeedbackBanner from '../common/FeedbackBanner';
import Footer from '../common/Footer';
import Nav from '../common/Nav';
import { LocationMapWithLibrary } from '../map/LocationMap';
import { MapMode } from '../map/LocationMap';
import HomeDialog from './home/HomeDialog';
import { InitialProps as HomeDialogInitialProps } from './home/HomeDialog';
import RequestDialog from './request/RequestDialog';
import { InitialProps as RequestDialogInitialProps } from './request/RequestDialog';
import TranslateDialog from './translate/TranslateDialog';

import {
  PageDependencies,
  GetInitialPropsDependencies,
} from '../../pages/_app';

type HomeData = {
  view: 'home';
  props: HomeDialogInitialProps;
};

type RequestData = {
  view: 'request';
  props: RequestDialogInitialProps;
};

type TranslateData = {
  view: 'translate';
  props: {};
};

export type InitialProps = {
  data: HomeData | RequestData | TranslateData;
};

export type Props = Pick<
  PageDependencies,
  // Some of these we need just for LocationMap
  | 'addressSearch'
  | 'fetchGraphql'
  | 'ui'
  | 'requestSearch'
  | 'browserLocation'
  | 'siteAnalytics'
  | 'liveAgent'
  | 'screenReaderSupport'
  | 'languages'
> &
  InitialProps & {
    noMap?: boolean;
  };

type State = {
  locationMapActive: boolean;
};

// This is the main container for content. We want to be at least full height on
// large screens to push the footer down to where you need to scroll for it.
const CONTAINER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  position: 'relative',
});

const BACKGROUND_MAP_CONTAINER_STYLE = css({
  position: 'fixed',
  width: '100%',
  top: HEADER_HEIGHT,
  bottom: 0,
  background: '#9B9B9B',
});

// We have one class for picking the service type and doing the entire request
// so that we can keep a consistent Map background behind the
// dialog and not repeatedly re-mount it.
//
// This class has two "views": the "summaries" view that lets the user pick a
// service request, and the "service" view for the request flow. That flow
// proceeds through the "questions" "location" and "contact" stages.
@observer
export default class RequestLayout extends React.Component<Props, State> {
  static defaultProps = {
    noMap: false,
  };

  state: State = {
    locationMapActive: false,
  };

  static async getInitialProps(
    ctx: NextContext,
    deps: Pick<GetInitialPropsDependencies, 'fetchGraphql'>
  ): Promise<InitialProps> {
    const { query } = ctx;

    let data;

    if (query.translate === '1') {
      data = {
        view: 'translate',
        props: {},
      };
    } else if (query.code) {
      data = {
        view: 'request',
        props: await RequestDialog.getInitialProps(ctx, deps),
      };
    } else {
      data = {
        view: 'home',
        props: await HomeDialog.getInitialProps(ctx, deps),
      };
    }

    return {
      data,
    };
  }

  componentDidMount() {
    const { addressSearch, fetchGraphql } = this.props;
    addressSearch.start(fetchGraphql);
  }

  componentWillReceiveProps() {
    this.setState({ locationMapActive: false });
  }

  componentWillUnmount() {
    const { addressSearch } = this.props;
    addressSearch.stop();
  }

  routeToServiceForm = async (code: string, stage: string = 'questions') => {
    if (stage === 'questions') {
      await Router.push(`/request?code=${code}`, `/request/${code}`);
    } else {
      await Router.push(
        `/request?code=${code}&stage=${stage}`,
        `/request/${code}/${stage}`
      );
    }

    window.scrollTo(0, 0);
  };

  setLocationMapActive = (active: boolean) => {
    const { locationMapActive } = this.state;

    if (locationMapActive !== active) {
      this.setState({ locationMapActive: active });
    }
  };

  render() {
    const {
      data,
      ui,
      noMap,
      requestSearch,
      addressSearch,
      browserLocation,
      siteAnalytics,
      liveAgent,
      fetchGraphql,
      screenReaderSupport,
      languages,
    } = this.props;
    const { locationMapActive } = this.state;
    const { mediaLarge } = ui;

    let mapMode: MapMode;
    if (locationMapActive) {
      mapMode = 'picker';
    } else {
      mapMode = 'inactive';
    }

    return (
      <div>
        <Nav activeSection="request" />

        {/* Outer box needs to take up at least the screen size on desktop, so
            that the content can center over the map and keep the footer from
            encroaching up. */}
        <div
          className={`mn--full ${CONTAINER_STYLE.toString()}`}
          style={{ backgroundColor: 'transparent' }}
          role="main"
        >
          <div className={`mn-fixed-child ${BACKGROUND_MAP_CONTAINER_STYLE}`}>
            {/* Condition must be on the inner element. If it's on the outer
            DIV, React 16's reconcilliation of the server and client (which are
            different because we're conditional on mediaLarge) will apply the
            runtime attributes to the server content. And things will be broken.*/}
            {(mediaLarge || !process.browser) && !noMap && (
              <LocationMapWithLibrary
                addressSearch={addressSearch}
                browserLocation={browserLocation}
                requestSearch={requestSearch}
                ui={ui}
                mode={mapMode}
                mobile={false}
              />
            )}
          </div>

          {/* We can't put any wrappers around the dialogs below because in the
               case of RequestDialog's location picker, it needs to make sure nothing
               is overlapping the map so it can get clicks. */}

          {data.view === 'home' && (
            <HomeDialog
              fetchGraphql={fetchGraphql}
              siteAnalytics={siteAnalytics}
              ui={ui}
              liveAgent={liveAgent}
              languages={languages}
              bypassTranslateDialog={data.props.bypassTranslateDialog}
              description={data.props.description}
              stage={data.props.stage}
              topServiceSummaries={data.props.topServiceSummaries}
            />
          )}

          {data.view === 'request' && (
            <RequestDialog
              fetchGraphql={fetchGraphql}
              addressSearch={addressSearch}
              browserLocation={browserLocation}
              requestSearch={requestSearch}
              screenReaderSupport={screenReaderSupport}
              ui={ui}
              routeToServiceForm={this.routeToServiceForm}
              setLocationMapActive={this.setLocationMapActive}
              description={data.props.description}
              service={data.props.service}
              serviceCode={data.props.serviceCode}
              stage={data.props.stage}
            />
          )}

          {data.view === 'translate' && (
            <TranslateDialog languages={languages} />
          )}
        </div>

        <Footer />
        <FeedbackBanner fit="DIALOG" />
      </div>
    );
  }
}
