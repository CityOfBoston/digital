// @flow

import React from 'react';
import { action, observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'glamor';

import type { AppStore } from '../../../data/store';

import { HEADER_HEIGHT } from '../../style-constants';

let Velocity;
if (typeof window !== 'undefined') {
  Velocity = require('velocity-animate');
}

const HEADER_STYLE = css({
  flexShrink: 0,
  background: 'white',
  position: 'relative',
  alignItems: 'center',
});

const HEADER_STICKY_STYLE = css({
  position: 'fixed',
  top: HEADER_HEIGHT,
  left: 0,
  right: 0,
});

const OR_CIRCLE_STYLE = css({
  fontSize: '1.5rem',
  fontStyle: 'italic',
  borderRadius: '50% 50%',
  borderColor: '#828282',
  width: '2em',
  height: '2em',
  lineHeight: '1.6em',
  display: 'inline-block',
  color: '#828282',
});

type Props = {|
  store: AppStore,
|}

@observer
export default class RecentRequestsHeader extends React.Component {
  props: Props;

  @observable containerEl: ?HTMLElement = null;
  @observable contentEl: ?HTMLElement = null;

  @action.bound
  setContainerEl(containerEl: ?HTMLElement) {
    this.containerEl = containerEl;
  }

  @action.bound
  setContentEl(contentEl: ?HTMLElement) {
    const { store } = this.props;

    this.contentEl = contentEl;

    if (contentEl) {
      store.requestSearch.searchHeaderHeight = contentEl.offsetHeight;
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

  scrollToTop() {
    if (this.containerEl && Velocity) {
      Velocity(this.containerEl, 'scroll', { offset: -HEADER_HEIGHT });
    }
  }

  handleFocus = () => {
    this.scrollToTop();
  }

  @action.bound
  handleBrowseClick() {
    const { store } = this.props;
    this.scrollToTop();
    store.requestSearch.query = '';
  }

  @computed get isHeaderSticky(): boolean {
    const { containerEl } = this;
    const { store } = this.props;

    if (!containerEl) {
      return false;
    }

    const containerBounds = containerEl.getBoundingClientRect();
    return !!store.ui.scrollY && containerBounds.top <= HEADER_HEIGHT;
  }

  @computed get containerHeight(): string | number {
    const { isHeaderSticky, contentEl } = this;

    if (!isHeaderSticky || !contentEl) {
      return 'auto';
    }

    return contentEl.offsetHeight;
  }

  @computed get isSearchNearYou(): boolean {
    const { store: { requestSearch, browserLocation } } = this.props;

    return !!browserLocation.location && !!requestSearch.mapCenter &&
      requestSearch.radiusKm < 0.5 &&
      (Math.abs(browserLocation.location.lat - requestSearch.mapCenter.lat) < 0.005) &&
      (Math.abs(browserLocation.location.lng - requestSearch.mapCenter.lng) < 0.005);
  }

  @computed get requestDurationText(): string {
    const { store: { requestSearch } } = this.props;
    const lastRequest = requestSearch.results[requestSearch.results.length - 1];

    if (!lastRequest) {
      return '';
    }

    let diff = (new Date() / 1000) - lastRequest.updatedAt;

    if (diff < 60) {
      return `${Math.round(diff)} seconds`;
    } else {
      diff /= 60;
    }

    if (diff < 60) {
      return `${Math.round(diff)} minutes`;
    } else {
      diff /= 60;
    }

    if (diff < 48) {
      return `${Math.round(diff)} hours`;
    } else {
      diff /= 24;
    }

    if (diff < 10) {
      return `${Math.round(diff)} days`;
    } else {
      diff /= 7;
    }

    if (diff < 6) {
      return `${Math.round(diff)} weeks`;
    } else {
      diff /= 4;
    }

    if (diff < 18) {
      return `${Math.round(diff)} months`;
    } else {
      diff /= 12;
    }

    return `${diff} years`;
  }

  render() {
    const { containerHeight, isHeaderSticky, requestDurationText, isSearchNearYou } = this;
    const { store: { requestSearch } } = this.props;

    return (
      <div ref={this.setContainerEl} style={{ height: containerHeight }}>
        <div className={`p-a500 g br br-t400 br--y ${HEADER_STYLE.toString()} ${isHeaderSticky ? HEADER_STICKY_STYLE.toString() : ''}`} ref={this.setContentEl}>
          <form className="sf sf--y sf--md g--5" acceptCharset="UTF-8" method="get" action="/lookup" onSubmit={this.handleSearchSubmit}>
            <div className="sf-i">
              <input type="text" name="q" placeholder="Search public reports…" value={requestSearch.query} onChange={this.handleSearchInput} onFocus={this.handleFocus} className="sf-i-f" />
              <button className="sf-i-b">Search</button>
            </div>
          </form>

          <div className="g--2 ta-c">
            <span className={`${OR_CIRCLE_STYLE.toString()} br br-a200`}>or</span>
          </div>

          <div className="g--5">
            <div className="t--sans t--upper">
              <a href="javascript:void(0)" onClick={this.handleBrowseClick}>Browse public reports</a>
            </div>

            <div
              style={{
                color: '#828282',
                fontStyle: 'italic',
              }}
            >
              {requestSearch.results.length
                ? `${requestSearch.results.length} cases ${isSearchNearYou ? 'near you' : 'in this area'} in the past ${requestDurationText}`
                : ''
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
