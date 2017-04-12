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

const STICKY_SEARCH_STYLE = css({
  position: 'fixed',
  top: HEADER_HEIGHT,
  background: 'white',
});

const CONTAINER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
});

export type Props = {
  store: AppStore,
}

@observer
export default class RecentRequests extends React.Component {
  props: Props;

  @observable.ref mainEl: ?HTMLElement = null;
  @observable.ref searchEl: ?HTMLElement = null;
  @observable query: string = '';

  scrollSelectedIntoViewDisposer: Function;
  updateWidthDisposer: Function;

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
    this.scrollSelectedIntoViewDisposer();
    this.updateWidthDisposer();
  }

  @action.bound
  setMainEl(mainEl: HTMLElement) {
    this.mainEl = mainEl;
  }

  @action.bound
  setSearchEl(searchEl: HTMLElement) {
    this.searchEl = searchEl;
  }

  scrollSelectedIntoView = () => {
    // Keeps us from getting a dependency on props
    const { store } = untracked(() => Object.assign({}, this.props));
    const { selectedRequest, selectedSource } = store.requestSearch;

    if (selectedRequest && this.mainEl && selectedSource !== 'list') {
      const requestEl = this.mainEl.querySelector(`[data-request-id="${selectedRequest.id}"]`);
      const { searchEl } = this;
      if (Velocity && requestEl && searchEl) {
        Velocity(requestEl, 'scroll', { offset: -HEADER_HEIGHT + -searchEl.clientHeight });
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

  @action.bound
  handleSearchSubmit(ev: SyntheticInputEvent) {
    const { mainEl } = this;
    const { store } = this.props;

    // This actually triggers the search to happen
    store.requestSearch.query = this.query;

    if (Velocity && mainEl) {
      const bounds = mainEl.getBoundingClientRect();
      Velocity(window.document.body, 'scroll', { offset: bounds.top + store.ui.scrollY + -HEADER_HEIGHT });
    }

    ev.preventDefault();
  }

  @action.bound
  handleSearchInput(ev: SyntheticInputEvent) {
    this.query = ev.target.value;
  }

  render() {
    const { store: { requestSearch, ui } } = this.props;
    const { results } = requestSearch;

    const containerStyle = {};
    const searchStyle = {};

    if (this.stickySearch && this.searchEl) {
      containerStyle.paddingTop = this.searchEl.clientHeight;
      searchStyle.width = requestSearch.resultsListWidth;
    }

    return (
      <div className={`${CONTAINER_STYLE.toString()}`} ref={this.setMainEl} style={containerStyle}>
        <div className={this.stickySearch && STICKY_SEARCH_STYLE} ref={this.setSearchEl} style={searchStyle}>
          <div className="p-a300">
            <form className="sf sf--y sf--md" acceptCharset="UTF-8" method="get" action="/lookup" onSubmit={this.handleSearchSubmit}>
              <div className="sf-i">
                <input type="text" name="q" placeholder="Search recent cases…" value={this.query} onInput={this.handleSearchInput} className="sf-i-f" />
                <button className="sf-i-b">Search</button>
              </div>
            </form>
          </div>

          <hr className="hr hr--dash" />
        </div>

        { results.map((request) => <RecentRequestRow key={request.id} request={request} requestSearch={requestSearch} ui={ui} />) }
      </div>
    );
  }
}
