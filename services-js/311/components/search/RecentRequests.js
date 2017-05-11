// @flow
/* eslint react/jsx-no-bind: 0 */

import React from 'react';
import { observable, action, autorun, untracked, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'glamor';

import type { AppStore } from '../../data/store';
import { HEADER_HEIGHT } from '../style-constants';

import LoadingIcons from '../common/LoadingIcons';
import RecentRequestRow from './RecentRequestRow';

let Velocity;
if (typeof window !== 'undefined') {
  Velocity = require('velocity-animate');
}

const CONTAINER_STYLE = css({
  background: 'white',
  // lets us scroll a full height without the footer coming up. There's actually
  // a little slop because of the sticky header.
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  position: 'relative',
  width: '40%',
  maxWidth: '35rem',
  display: 'flex',
  flexDirection: 'column',
});

const LOADING_CONTAINER_STYLE = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
});

const LOADING_WRAPPER_STYLE = css({
  display: 'flex',
  height: 120,
  marginBottom: 200,
});

export type Props = {|
  store: AppStore,
|}

@observer
export default class RecentRequests extends React.Component {
  props: Props;

  @observable.ref mainEl: ?HTMLElement = null;

  scrollSelectedIntoViewDisposer: ?Function;
  updateWidthDisposer: ?Function;

  componentDidMount() {
    const { store: { ui, requestSearch } } = this.props;

    this.scrollSelectedIntoViewDisposer = autorun(this.scrollSelectedIntoView);
    this.updateWidthDisposer = reaction(() => ({
      mainEl: this.mainEl,
      // means we'll get triggered on resizes, which is important
      // for being % width.
      visibleWidth: ui.visibleWidth,
    }),
    ({ mainEl }) => {
      if (mainEl) {
        requestSearch.resultsListWidth = mainEl.clientWidth;
      }
    }, {
      fireImmediately: true,
      name: 'update results list width',
    });
  }

  componentWillUnmount() {
    if (this.scrollSelectedIntoViewDisposer) {
      this.scrollSelectedIntoViewDisposer();
    }

    if (this.updateWidthDisposer) {
      this.updateWidthDisposer();
    }
  }

  handleSearchSubmit = (ev: SyntheticInputEvent) => {
    // nothing to do, because we are auto-searching
    ev.preventDefault();
  }

  @action.bound
  handleSearchInput(ev: SyntheticInputEvent) {
    const { store } = this.props;

    store.requestSearch.query = ev.target.value;
  }

  @action.bound
  setMainEl(mainEl: ?HTMLElement) {
    this.mainEl = mainEl;
  }

  scrollSelectedIntoView = () => {
    // Keeps us from getting a dependency on props
    const { store } = untracked(() => Object.assign({}, this.props));
    const { selectedRequest, selectedSource } = store.requestSearch;

    if (selectedRequest && this.mainEl && selectedSource !== 'list') {
      const requestEl = this.mainEl.querySelector(`[data-request-id="${selectedRequest.id}"]`);
      if (Velocity && requestEl) {
        Velocity(requestEl, 'scroll', { offset: -HEADER_HEIGHT });
      }
    }
  }

  render() {
    const { store: { requestSearch, ui } } = this.props;
    const { results, query, resultsQuery } = requestSearch;

    return (
      <div className={CONTAINER_STYLE} ref={this.setMainEl}>
        <div className="p-a300">
          <form className="sf sf--y sf--md" acceptCharset="UTF-8" method="get" action="/lookup" onSubmit={this.handleSearchSubmit} role="search">
            <div className="sf-i">
              <input type="text" name="q" aria-label="Search field" placeholder="Search by case ID or keywords…" value={requestSearch.query} onChange={this.handleSearchInput} className="sf-i-f" />
              <button type="submit" className="sf-i-b">Search</button>
            </div>
          </form>
        </div>

        <h2 className="a11y--h">Search Results</h2>

        { results.length === 0 && query !== resultsQuery && (
          <div className={LOADING_CONTAINER_STYLE}>
            <div className={LOADING_WRAPPER_STYLE}>
              <LoadingIcons initialDelay={0} serverCompatible reduceMotion={ui.reduceMotion} />
            </div>
          </div>
        )}

        { results.map((request) => <RecentRequestRow key={request.id} request={request} requestSearch={requestSearch} ui={ui} />) }
        { results.length === 0 && query === resultsQuery && (
          <div className="p-a300">
            <div className="t--intro">No results found</div>
            <div className="t--info">Try a different search term or move the map to search a different area.</div>
          </div>
        )}
      </div>
    );
  }
}
