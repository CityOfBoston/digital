// @flow
/* eslint react/jsx-no-bind: 0 */

import React from 'react';
import { observable, action, autorun, untracked, computed } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'glamor';

import type { AppStore } from '../../../data/store';
import type { SearchRequest } from '../../../data/types';
import { HEADER_HEIGHT } from '../../style-constants';

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

const REQUEST_STYLE = css({
  display: 'flex',
  cursor: 'pointer',
});

const THUMBNAIL_SYLE = css({
  width: '8rem',
  height: '8rem',
  margin: '0 1rem 0 0',
  flexShrink: 0,
  backgroundSize: 'cover',
});

const REQUEST_INFO_STYLE = css({
  height: '8rem',
  display: 'flex',
  flex: '1 1 0',
  flexDirection: 'column',
  minWidth: 0,
});

const DESCRIPTION_STYLE = css({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minHeight: 0,
});

const STATUS_COMMON_STYLE = css({
  color: 'white',
  padding: '0.1111rem 0.33333rem',
  marginRight: '0.6666666rem',
});

const STATUS_OPEN_STYLE = css(STATUS_COMMON_STYLE, {
  backgroundColor: '#62A744',
});

const STATUS_CLOSE_STYLE = css(STATUS_COMMON_STYLE, {
  backgroundColor: '#F6A623',
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

  scrollSelectedIntoViewDisposer: ?Function = null;

  componentDidMount() {
    this.scrollSelectedIntoViewDisposer = autorun(this.scrollSelectedIntoView);
  }

  componentWillUnmount() {
    if (this.scrollSelectedIntoViewDisposer) {
      this.scrollSelectedIntoViewDisposer();
    }
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

  @action.bound
  handleHoverRequest(request: SearchRequest) {
    const { store: { requestSearch } } = this.props;
    requestSearch.selectedRequest = request;
    requestSearch.selectedSource = 'list';
  }

  @action.bound
  handleUnhoverRequest() {
    const { store: { requestSearch } } = this.props;
    requestSearch.selectedRequest = null;
    requestSearch.selectedSource = null;
  }

  render() {
    const { store: { requestSearch } } = this.props;
    const { results } = requestSearch;

    const containerStyle = {};
    const searchStyle = {};

    if (this.stickySearch && this.searchEl && this.mainEl) {
      containerStyle.paddingTop = this.searchEl.clientHeight;
      searchStyle.width = this.mainEl.clientWidth;
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


        { results.map(this.renderRequest) }
      </div>
    );
  }

  renderRequest = (request: SearchRequest) => {
    const { store: { requestSearch } } = this.props;
    const mediaUrl = request.mediaUrl || '/static/img/311-watermark.svg';

    let statusStyle;
    let statusText;

    if (request.status === 'open') {
      statusStyle = STATUS_OPEN_STYLE;
      statusText = 'Opened';
    } else {
      statusStyle = STATUS_CLOSE_STYLE;
      statusText = 'Closed';
    }

    return (
      <div
        key={request.id}
        data-request-id={request.id}
        className={`p-a300 ${REQUEST_STYLE.toString()}`}
        onMouseEnter={this.handleHoverRequest.bind(null, request)}
        onMouseLeave={this.handleUnhoverRequest}
        style={{
          backgroundColor: (requestSearch.selectedRequest && requestSearch.selectedRequest.id === request.id) ? '#e0e0e0' : 'transparent',
        }}
      >
        <div className={THUMBNAIL_SYLE} style={{ backgroundImage: `url(${mediaUrl})` }} />
        <div className={REQUEST_INFO_STYLE}>
          <h4 className="t--intro t--ellipsis">{request.service.name}</h4>
          <div className={DESCRIPTION_STYLE}>
            { request.description}
          </div>
          <div style={{ paddingTop: 5 }}>
            <span className={`t--upper t--sans ${statusStyle.toString()}`}>{statusText}</span>
            <span className="t--info" style={{ fontSize: 14 }}>{ request.updatedAtRelativeString }</span>
          </div>
        </div>
      </div>
    );
  }
}
