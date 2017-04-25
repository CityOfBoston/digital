// @flow
/* eslint react/jsx-no-bind: 0 */

import React from 'react';
import { observable, action, autorun, untracked, computed, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'glamor';

import type { AppStore } from '../../../data/store';
import { HEADER_HEIGHT } from '../../style-constants';

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

  @action.bound
  setMainEl(mainEl: ?HTMLElement) {
    this.mainEl = mainEl;
  }

  scrollSelectedIntoView = () => {
    // Keeps us from getting a dependency on props
    const { store } = untracked(() => Object.assign({}, this.props));
    const { selectedRequest, selectedSource, searchHeaderHeight } = store.requestSearch;

    if (selectedRequest && this.mainEl && selectedSource !== 'list') {
      const requestEl = this.mainEl.querySelector(`[data-request-id="${selectedRequest.id}"]`);
      if (Velocity && requestEl) {
        Velocity(requestEl, 'scroll', { offset: -HEADER_HEIGHT + -searchHeaderHeight });
      }
    }
  }

  @computed get stickySearch(): boolean {
    const { store } = untracked(() => Object.assign({}, this.props));

    if (!this.mainEl) {
      return false;
    }

    const mainBounds = this.mainEl.getBoundingClientRect();
    return store.ui.scrollY && mainBounds.top <= HEADER_HEIGHT;
  }

  render() {
    const { store: { requestSearch, ui } } = this.props;
    const { results } = requestSearch;

    return (
      <div className={CONTAINER_STYLE} ref={this.setMainEl}>
        { results.map((request) => <RecentRequestRow key={request.id} request={request} requestSearch={requestSearch} ui={ui} />) }
        { results.length === 0 && (
          <div className="p-a300">
            <div className="t--intro">No results found</div>
            <div className="t--info">Try a different search term or move the map to search a different area.</div>
          </div>
        )}
      </div>
    );
  }
}
