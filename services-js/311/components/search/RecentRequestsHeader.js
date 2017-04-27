// @flow

import React from 'react';
import { action, observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'glamor';

import type { AppStore } from '../../data/store';

import { HEADER_HEIGHT } from '../style-constants';

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

  @action.bound
  setContainerEl(containerEl: ?HTMLElement) {
    this.containerEl = containerEl;
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

  @action.bound
  handleBrowseClick() {
    const { store } = this.props;
    this.scrollToTop();
    store.requestSearch.query = '';
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
    const { requestDurationText, isSearchNearYou } = this;
    const { store: { requestSearch } } = this.props;

    return (
      <div ref={this.setContainerEl}>
        <div className={`p-a500 g br br-t400 br--y ${HEADER_STYLE.toString()}`}>
          <form className="sf sf--y sf--md g--5" acceptCharset="UTF-8" method="get" action="/lookup" onSubmit={this.handleSearchSubmit}>
            <div className="sf-i">
              <input type="text" name="q" placeholder="Search by case ID or keywords…" value={requestSearch.query} onChange={this.handleSearchInput} className="sf-i-f" />
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
