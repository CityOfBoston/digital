// @flow

import React from 'react';
import Link from 'next/link';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'glamor';

import type RequestSearch from '../../data/store/RequestSearch';
import type Ui from '../../data/store/Ui';
import type { SearchRequest } from '../../data/types';

import { HEADER_HEIGHT } from '../style-constants';

const REQUEST_STYLE = css({
  display: 'flex',
  cursor: 'pointer',
});

const THUMBNAIL_SYLE = css({
  width: '6rem',
  height: '6rem',
  margin: '0 1rem 0 0',
  flexShrink: 0,
  backgroundSize: 'cover',
});

const REQUEST_INFO_STYLE = css({
  height: '6rem',
  display: 'flex',
  flex: '1 1 0',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minWidth: 0,
});

const REQUEST_SERVICE_NAME_STYLE = css({
  height: '1.45em',
  marginTop: '-.4em',
});

const DESCRIPTION_STYLE = css({
  overflow: 'hidden',
  height: '2.5em',
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

export type Props = {|
  request: SearchRequest,
  requestSearch: RequestSearch,
  ui: Ui,
|};

@observer
export default class RecentRequestRow extends React.Component {
  props: Props;
  @observable el: ?HTMLElement;

  @action.bound
  setEl(el: ?HTMLElement) {
    this.el = el;
  }

  @computed get selected(): boolean {
    const { request, requestSearch } = this.props;
    return !!requestSearch.selectedRequest && requestSearch.selectedRequest.id === request.id;
  }

  @computed get showImage(): boolean {
    if (!this.el) {
      return false;
    }

    const { ui } = this.props;

    const rect = this.el.getBoundingClientRect();
    const buffer = ui.visibleHeight / 2;
    // Referencing scrollY so we get updated on scroll
    return ui.debouncedScrollY >= 0 && rect.bottom > (HEADER_HEIGHT - buffer) && rect.top - HEADER_HEIGHT < (ui.visibleHeight + buffer);
  }

  @action.bound
  handleHover() {
    const { request, requestSearch } = this.props;
    requestSearch.selectedRequest = request;
    requestSearch.selectedSource = 'list';
  }

  @action.bound
  handleUnhover() {
    const { requestSearch } = this.props;
    requestSearch.selectedRequest = null;
    requestSearch.selectedSource = null;
  }

  render() {
    const { request } = this.props;

    const defaultUrl = this.selected ? '/static/img/311-logo-grey-on-white.svg' : '/static/img/311-logo-white-on-grey.svg';
    const mediaUrl = (this.showImage && request.mediaUrl) || '';

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
      <Link href={`/reports?id=${request.id}`} as={`/reports/${request.id}`}>
        <a
          ref={this.setEl}
          data-request-id={request.id}
          className={`p-a300 ${REQUEST_STYLE.toString()}`}
          onMouseEnter={this.handleHover}
          onMouseLeave={this.handleUnhover}
          style={{
            backgroundColor: this.selected ? '#e0e0e0' : 'transparent',
            color: 'inherit',
          }}
        >
          <div className={THUMBNAIL_SYLE} style={{ backgroundImage: `url(${defaultUrl})` }}>
            <div className={THUMBNAIL_SYLE} style={{ backgroundImage: `url(${mediaUrl})` }} />
          </div>
          <div className={REQUEST_INFO_STYLE}>
            <h4 className={`t--intro t--ellipsis ${REQUEST_SERVICE_NAME_STYLE.toString()}`}>{request.service.name}</h4>
            <div className={DESCRIPTION_STYLE}>
              { request.description}
            </div>
            <div style={{ paddingTop: 5 }}>
              <span className={`t--upper t--sans ${statusStyle.toString()}`}>{statusText}</span>
              <span className="t--info" style={{ fontSize: 14 }}>{ request.updatedAtRelativeString }</span>
            </div>
          </div>
        </a>
      </Link>
    );
  }
}
