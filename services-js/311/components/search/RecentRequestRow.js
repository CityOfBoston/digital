// @flow

import React from 'react';
import Link from 'next/link';
import Router from 'next/router';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'emotion';

import type RequestSearch from '../../data/store/RequestSearch';
import type Ui from '../../data/store/Ui';
import type { SearchCase } from '../../data/types';

import {
  HEADER_HEIGHT,
  MEDIA_LARGE,
  GREEN,
  YELLOW,
  GRAY_100,
  CLEAR_FIX,
  assetUrl,
} from '../style-constants';

const REQUEST_STYLE = css({
  display: 'block',
  cursor: 'pointer',
  borderBottom: `1px dashed ${GRAY_100}`,
  width: '100%',
  float: 'left',
  ':last-child': {
    borderBottom: 'none',
  },
  ...CLEAR_FIX,
});

const THUMBNAIL_SYLE = css({
  width: '4rem',
  height: '4rem',
  margin: '0 1rem 0 0',
  backgroundSize: 'cover',
  float: 'left',
  [MEDIA_LARGE]: {
    width: '6rem',
    height: '6rem',
  },
});

const REQUEST_INFO_STYLE = css({
  height: '4rem',
  display: 'flex',
  marginLeft: '5rem',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minWidth: 0,
  [MEDIA_LARGE]: {
    height: '6rem',
    marginLeft: '7rem',
  },
});

const REQUEST_SERVICE_NAME_STYLE = css({
  height: '1.45em',
  marginTop: '-.4em',
});

const DESCRIPTION_STYLE = css({
  overflow: 'hidden',
  height: '1.5em',

  [MEDIA_LARGE]: {
    height: '2.5em',
  },
});

const STATUS_COMMON_STYLE = css({
  color: 'white',
  padding: '0.1111rem 0.33333rem',
  marginRight: '0.6666666rem',
});

const STATUS_OPEN_STYLE = css(STATUS_COMMON_STYLE, {
  backgroundColor: GREEN,
});

const STATUS_CLOSE_STYLE = css(STATUS_COMMON_STYLE, {
  backgroundColor: YELLOW,
});

export type Props = {|
  request: SearchCase,
  requestSearch: RequestSearch,
  ui: Ui,
|};

@observer
export default class RecentRequestRow extends React.Component<Props> {
  @observable el: ?HTMLElement;

  @action.bound
  setEl(el: ?HTMLElement) {
    this.el = el;
  }

  @computed
  get selected(): boolean {
    const { request, requestSearch } = this.props;
    return (
      !!requestSearch.selectedRequest &&
      requestSearch.selectedRequest.id === request.id
    );
  }

  @computed
  get showImage(): boolean {
    if (!this.el) {
      return false;
    }

    const { ui } = this.props;

    const rect = this.el.getBoundingClientRect();
    const buffer = ui.visibleHeight / 2;
    // Referencing scrollY so we get updated on scroll
    return (
      ui.debouncedScrollY >= 0 &&
      rect.bottom > HEADER_HEIGHT - buffer &&
      rect.top - HEADER_HEIGHT < ui.visibleHeight + buffer
    );
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

    const defaultUrl = this.selected
      ? assetUrl('img/311-logo-grey-on-white.svg')
      : assetUrl('img/311-logo-white-on-grey.svg');
    const thumbnailUrl =
      (this.showImage &&
        request.images.length &&
        request.images[0].squareThumbnailUrl) ||
      '';

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
      <Link
        prefetch={!!Router.router}
        href={`/reports?id=${request.id}`}
        as={`/reports/${request.id}`}
      >
        <a
          ref={this.setEl}
          data-request-id={request.id}
          className={`p-a300 br ${REQUEST_STYLE.toString()}`}
          onMouseEnter={this.handleHover}
          onMouseLeave={this.handleUnhover}
          style={{
            backgroundColor: this.selected ? GRAY_100 : 'transparent',
            color: 'inherit',
          }}
        >
          <div
            className={THUMBNAIL_SYLE}
            style={{ backgroundImage: `url(${defaultUrl})` }}
          >
            <div
              className={THUMBNAIL_SYLE}
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
            />
          </div>
          <div className={REQUEST_INFO_STYLE}>
            <h4
              className={`t--intro t--ellipsis ${REQUEST_SERVICE_NAME_STYLE.toString()}`}
            >
              {request.service.name}
            </h4>
            <div className={DESCRIPTION_STYLE}>
              {request.description}
            </div>
            <div style={{ paddingTop: 5 }}>
              <span className={`t--upper t--sans ${statusStyle.toString()}`}>
                {statusText}
              </span>
              <span className="t--info" style={{ fontSize: 14 }}>
                {request.requestedAtRelativeString}
              </span>
            </div>
          </div>
        </a>
      </Link>
    );
  }
}
