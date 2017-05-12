// @flow
/* eslint react/no-danger: 0 */

import React from 'react';
import { css } from 'glamor';

import type { Request } from '../../data/types';
import type { AppStore } from '../../data/store';

import SectionHeader from '../common/SectionHeader';
import waypoints, { WAYPOINT_BASE_OPTIONS } from '../map/WaypointMarkers';
import { MEDIA_LARGE } from '../style-constants';

export type DefaultProps = {|
  submitted: boolean,
|}

export type Props = {|
  request: Request,
  store: AppStore,
  submitted?: boolean,
|}

const IMG_STYLE = css({
  display: 'block',
  width: '100%',
  [MEDIA_LARGE]: {
    minHeight: 300,
  },
});

const MAP_WRAPPER_STYLE = css({
  position: 'relative',
});

const WAYPOINT_STYLE = css({
  position: 'absolute',
  width: WAYPOINT_BASE_OPTIONS.iconSize.x,
  height: WAYPOINT_BASE_OPTIONS.iconSize.y,
  top: '50%',
  left: '50%',
  transform: `translate(${-WAYPOINT_BASE_OPTIONS.iconAnchor.x}px, ${-WAYPOINT_BASE_OPTIONS.iconAnchor.y}px)`,
});

function renderSubmitted({ id, updatedAtString }: Request, submitted: boolean) {
  if (!submitted) {
    return null;
  }

  return (
    <div className="b b--g p-a500 m-v500">
      <div className="txt-l" style={{ marginTop: 0 }}>Report submitted successfully — {updatedAtString}</div>
      <div className="t--intro" style={{ fontStyle: 'normal' }}>
        Thank you for submitting. Your case number is #{id}.
        If you gave your email address, we’ll send you an email when it’s
        resolved. You can also bookmark this page to check back on it.
      </div>
    </div>
  );
}
function renderStatus({ status, statusNotes, updatedAtString }: Request) {
  if (status !== 'closed') {
    return null;
  }

  return (
    <div className="b b--g p-a500 m-v500">
      <div className="txt-l" style={{ marginTop: 0 }}>Resolution — {updatedAtString}</div>
      <div className="t--intro" style={{ fontStyle: 'normal' }}>{statusNotes}</div>
    </div>
  );
}


function makeMapboxUrl(store: AppStore, request: Request, size: number): string {
  const { apiKeys: { mapbox } } = store;
  const { location } = request;

  if (!location) {
    return '';
  }

  return `https://api.mapbox.com/styles/v1/${mapbox.stylePath}/static/${location.lng},${location.lat},15/${size}x${size}@2x?attribution=false&logo=false&access_token=${encodeURIComponent(mapbox.accessToken)}`;
}

export default function CaseView({ request, store, submitted }: Props) {
  const waypointIcon = request.status === 'open' ? waypoints.greenFilled : waypoints.orangeFilled;

  return (
    <div>
      <div>
        <SectionHeader subtitle={<span style={{ whiteSpace: 'nowrap' }}>{`Case no: #${request.id}`}</span>}>{request.service.name}</SectionHeader>

        <div className="m-v300 t--info">
          Submitted on {request.requestedAtString} {request.address && ` — ${request.address}`}
        </div>
      </div>

      { renderSubmitted(request, submitted || false) }

      { renderStatus(request) }

      { request.description &&
        <div className="m-v500">
          <div className="txt-l">Description</div>
          <div className="t--intro" style={{ fontStyle: 'normal' }}>{request.description}</div>
        </div>
      }

      <div className="g m-v500">
        { request.location &&
          <div className="g--6">
            <div className={MAP_WRAPPER_STYLE}>
              <img className={`${IMG_STYLE.toString()} m-b500 br br-a150`} src={makeMapboxUrl(store, request, 440)} alt={`Map of ${request.address || ''}`} />
              <div className={`${WAYPOINT_STYLE.toString()}`} dangerouslySetInnerHTML={{ __html: waypointIcon.html }} />
            </div>
          </div>
        }

        <div className="g--6">
          { request.mediaUrl && <a href={request.mediaUrl} target="_blank" rel="noopener noreferrer"><img className={`${IMG_STYLE.toString()} m-b500 br br-a150`} alt="Submission" src={request.mediaUrl} /></a> }
        </div>
      </div>
    </div>
  );
}

CaseView.defaultProps = {
  submitted: false,
};
