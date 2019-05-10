import React from 'react';
import { action, autorun, observable } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'emotion';

import {
  MEDIA_LARGE,
  GRAY_100,
  HEADER_HEIGHT,
  WHITE,
} from '@cityofboston/react-fleet';

import RequestSearch from '../../data/store/RequestSearch';
import Ui from '../../data/store/Ui';

import { GRAY_200, CLEAR_FIX } from '../style-constants';

import LoadingIcons from '../common/LoadingIcons';
import RecentRequestRow from './RecentRequestRow';
import RecentRequestsSearchForm from './RecentRequestsSearchForm';

let Velocity;
if (typeof window !== 'undefined') {
  Velocity = require('velocity-animate');
}

const CONTAINER_STYLE = css(
  {
    background: WHITE,
    position: 'relative',

    [MEDIA_LARGE]: {
      width: '40%',
      maxWidth: '35rem',
      // lets us scroll a full height without the footer coming up. There's actually
      // a little slop because of the sticky header.
      minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
    },
  },
  CLEAR_FIX
);

const SEARCH_CONTAINER_STYLE = css({
  display: 'none',
  borderBottom: `1px dashed ${GRAY_100}`,
  [MEDIA_LARGE]: {
    display: 'block',
  },
});

const SEARCH_RESULTS_HEADER_STYLE = css({
  fontSize: 14,
  color: GRAY_200,
  letterSpacing: '1px',
  paddingTop: '.475rem',
  paddingBottom: 0,
});

// While we would prefer to make this so that the loading spinner is vertically
// centered in the height of the empty search results area, that runs afoul of
// IE 10/11 flexbox behavior. To get the height of the empty area down to this
// element we need to flex: 1 on the column, but those browsers won't let a
// flex: 1 element grow its parent, so the column could never expand larger to
// accommodate search results.
const LOADING_CONTAINER_STYLE = css({
  marginTop: '10%',
  position: 'absolute',
  zIndex: 2,
  width: '100%',
  [MEDIA_LARGE]: {
    marginTop: '30%',
  },
});

const LOADING_WRAPPER_STYLE = css({
  display: 'flex',
  height: 120,
  marginBottom: 30,
  [MEDIA_LARGE]: {
    marginBottom: 200,
  },
});

const REQUEST_LIST_STYLE = css({
  transition: 'opacity 200ms',
});

const LOADING_REQUEST_LIST_STYLE = css({
  pointerEvents: 'none',
  opacity: 0.2,
});

export type Props = {
  requestSearch: RequestSearch;
  ui: Ui;
  isMobile: boolean;
};

@observer
export default class RecentRequests extends React.Component<Props> {
  @observable mainEl: HTMLElement | null = null;

  mobxDisposers: Array<Function> = [];

  static defaultProps = {
    isMobile: false,
  };

  componentDidMount() {
    this.mobxDisposers.push(
      autorun(this.scrollSelectedIntoView),
      autorun(this.scrollOnResultsChange)
    );
  }

  componentWillUnmount() {
    this.mobxDisposers.forEach(d => d());
  }

  @action.bound
  setMainEl(mainEl: HTMLElement | null) {
    this.mainEl = mainEl;
  }

  @action.bound
  clearSearch() {
    this.props.requestSearch.query = '';
  }

  scrollSelectedIntoView = () => {
    const { isMobile, requestSearch } = this.props;

    // don't scroll on mobile
    if (isMobile) {
      return;
    }

    const { mainEl } = this;
    const { selectedRequest, selectedSource } = requestSearch;

    if (selectedRequest && mainEl && selectedSource !== 'list') {
      const requestEl = mainEl.querySelector(
        `[data-request-id="${selectedRequest.id}"]`
      );

      if (Velocity && requestEl) {
        Velocity(requestEl, 'scroll', { offset: -HEADER_HEIGHT });
      }
    }
  };

  scrollOnResultsChange = () => {
    const { isMobile, requestSearch } = this.props;

    // don't scroll on mobile
    if (isMobile) {
      return;
    }

    const { mainEl } = this;
    const { results } = requestSearch;

    if (results) {
      if (Velocity && mainEl) {
        Velocity(document.documentElement, 'scroll', {
          offset: 0,
        });
      }
    }
  };

  render() {
    const { requestSearch, isMobile, ui } = this.props;
    const { results, loading, resultsQuery, resultsError } = requestSearch;

    return (
      <div className={CONTAINER_STYLE} ref={this.setMainEl}>
        <div className={`p-a300 ${SEARCH_CONTAINER_STYLE.toString()}`}>
          <RecentRequestsSearchForm requestSearch={requestSearch} />
        </div>

        <h2 className="a11y--h">Search Results</h2>

        {loading && (
          <div className={LOADING_CONTAINER_STYLE}>
            <div className={LOADING_WRAPPER_STYLE}>
              <LoadingIcons initialDelay={0} reduceMotion={ui.reduceMotion} />
            </div>
          </div>
        )}

        {resultsError && (
          <div className="p-a300">
            <div className="t--intro">
              <span className="t--err">Uh-oh!</span>
            </div>

            <div className="t--info m-v200">
              <span className="t--err">
                Search results aren’t loading right now because of a server
                problem.
              </span>
            </div>

            <div className="t--info m-v200">
              <span className="t--err">Please try again later.</span>
            </div>
          </div>
        )}

        {results.length === 0 && !loading && !resultsError && (
          <div className="p-a300">
            <div className="t--intro">No results found</div>

            {resultsQuery ? (
              [
                <div className="t--info m-v300" key="p1">
                  Your search didn’t return any results. Please first make sure
                  you spelled everything correctly. You can also use different
                  words, more general words, or fewer words.
                </div>,
                <div className="t--info m-v300" key="p2">
                  If you still can’t find what you’re looking for, try moving
                  the map or zooming it out. You’ll see cases in the area the
                  map is showing.
                </div>,
              ]
            ) : (
              <div className="t--info m-v300">
                There are no recent requests in this area. Try moving the map or
                zooming it out. You’ll see cases in the area the map is showing.
              </div>
            )}
          </div>
        )}

        <div
          className={`${REQUEST_LIST_STYLE.toString()} ${
            loading ? LOADING_REQUEST_LIST_STYLE.toString() : ''
          }`}
        >
          {results.length > 0 && (
            <div
              className={`t--sans t--upper t--g300 p-a300 m-v200 t--ellipsis ${SEARCH_RESULTS_HEADER_STYLE.toString()}`}
            >
              {resultsQuery && `Latest ${resultsQuery} cases in this area`}
              {!resultsQuery && `Latest cases in this area`}

              {resultsQuery && (
                <span>
                  {' — '}
                  <button
                    type="button"
                    onClick={this.clearSearch}
                    className="lnk"
                    style={{ textTransform: 'inherit' }}
                  >
                    Clear search
                  </button>
                </span>
              )}
            </div>
          )}
          {results.map(request => (
            <RecentRequestRow
              key={request.id}
              request={request}
              requestSearch={requestSearch}
              ui={ui}
              hoverEffects={!isMobile}
            />
          ))}
        </div>
      </div>
    );
  }
}
