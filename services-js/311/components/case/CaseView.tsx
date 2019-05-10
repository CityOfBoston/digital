import React from 'react';
import { css } from 'emotion';
import getConfig from 'next/config';

import { MEDIA_LARGE, CHARLES_BLUE } from '@cityofboston/react-fleet';

import { Request } from '../../data/types';

import SectionHeader from '../common/SectionHeader';
import waypoints, { WAYPOINT_STYLE } from '../map/WaypointMarkers';

// Case types where we show the scheduled date.
const SCHEDULED_CASE_TYPES = ['SCHDBLKITM'];

export type DefaultProps = {
  submitted: boolean;
  noMap: boolean;
};

export type Props = {
  request: Request;
  submitted?: boolean;
  noMap?: boolean;
};

const IMG_STYLE = css({
  display: 'block',
  width: '100%',
  [MEDIA_LARGE]: {
    minHeight: 220,
  },
});

const IMG_WRAPPER_STYLE = css({
  display: 'block',
  position: 'relative',
});

const IMG_LABEL_STYLE = css({
  position: 'absolute',
  color: CHARLES_BLUE,
  width: '100%',
  bottom: 0,
  background: 'rgba(255, 255, 255, .8)',
  fontWeight: 'bold',
});

const SQUARE_MAP_WRAPPER_STYLE = css({
  position: 'relative',
  // 1:1 aspect ratio hack. Keeps the page from jumping when the image loads
  paddingBottom: '100%',
});

const LONG_MAP_WRAPPER_STYLE = css({
  position: 'relative',
  // Aspect ratio hack. Keeps the page from jumping when the image loads. The
  // 22% here is the ratio of the image we tell Mapbox to make.
  paddingBottom: '22%',
});

const MAP_IMG_STYLE = css({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

const HUMANIZED_TAG_NAMES = {
  Create: 'Original Submission',
  Close: 'Resolution',
  Updated: 'Resolution',
};

function renderServiceNotice({
  expectedAtString,
  serviceNotice,
  service: { code },
}: Request) {
  return (
    <div>
      <div className="txt-l" style={{ marginTop: 0 }}>
        What happens next?
      </div>

      {SCHEDULED_CASE_TYPES.indexOf(code) !== -1 && expectedAtString && (
        <div className="t--intro m-v200">
          Your scheduled date is <strong>{expectedAtString}</strong>.
        </div>
      )}

      {serviceNotice && (
        <div className="t--info" style={{ fontStyle: 'normal' }}>
          {serviceNotice}
        </div>
      )}
    </div>
  );
}

function renderSubmitted(req: Request) {
  const {
    id,
    service: { code },
    updatedAtString,
    expectedAtString,
    serviceNotice,
  } = req;

  return (
    <div className="b b--g p-a500 m-v500">
      <div className="txt-l" style={{ marginTop: 0 }}>
        Request submitted successfully — {updatedAtString}
      </div>

      {serviceNotice ||
      (expectedAtString && SCHEDULED_CASE_TYPES.indexOf(code) !== -1) ? (
        <div>
          <div className="t--intro m-b500" style={{ fontStyle: 'normal' }}>
            Thank you for submitting. Your case reference number is{' '}
            <span style={{ whiteSpace: 'nowrap' }}>#{id}</span>.
          </div>

          {renderServiceNotice(req)}
        </div>
      ) : (
        <div className="t--intro" style={{ fontStyle: 'normal' }}>
          Thank you for submitting. Your case reference number is{' '}
          <span style={{ whiteSpace: 'nowrap' }}>#{id}</span>. If you gave your
          email address, we’ll send you an email when it’s resolved. You can
          also bookmark this page to check back on it.
        </div>
      )}
    </div>
  );
}

function renderStatus(req: Request) {
  const {
    status,
    service: { code },
    closureReason,
    closureComment,
    updatedAtString,
    expectedAtString,
    serviceNotice,
  } = req;

  if (status === 'closed') {
    return (
      <div className="b b--g p-a500 m-v500">
        <div className="txt-l" style={{ marginTop: 0 }}>
          {closureReason || 'Resolution'} — {updatedAtString}
        </div>
        <div className="t--intro" style={{ fontStyle: 'normal' }}>
          {closureComment || 'Case closed.'}
        </div>
      </div>
    );
  } else if (
    serviceNotice ||
    (expectedAtString && SCHEDULED_CASE_TYPES.indexOf(code) !== -1)
  ) {
    return (
      <div className="b b--g p-a500 m-v500">{renderServiceNotice(req)}</div>
    );
  } else {
    return null;
  }
}

function makeMapboxUrl(
  { mapboxStylePath, mapboxAccessToken }: any,
  request: Request,
  width: number,
  height: number
): string {
  const { location } = request;

  if (!location) {
    return '';
  }

  return `https://api.mapbox.com/styles/v1/${mapboxStylePath}/static/${
    location.lng
  },${
    location.lat
  },15/${width}x${height}@2x?attribution=false&logo=false&access_token=${encodeURIComponent(
    mapboxAccessToken
  )}`;
}

export default function CaseView({ request, submitted, noMap }: Props) {
  const { publicRuntimeConfig } = getConfig();

  const waypointIcon =
    request.status === 'open' ? waypoints.greenFilled : waypoints.orangeFilled;

  const longMap = request.images.length >= 2;

  return (
    <div>
      <div>
        <SectionHeader
          subtitle={
            <span
              style={{
                whiteSpace: 'nowrap',
              }}
            >{`Case ref: #${request.id}`}</span>
          }
        >
          {request.service.name}
        </SectionHeader>

        <div className="m-v300 t--info">
          {request.requestedAtString &&
            `Submitted on ${request.requestedAtString}`}
          {request.address && request.requestedAtString && ' — '}
          {request.address && `${request.address}`}
        </div>
      </div>

      {submitted && renderSubmitted(request)}
      {!submitted && renderStatus(request)}

      {request.description && (
        <div className="m-v500">
          <div className="txt-l">Description</div>
          <div className="t--intro" style={{ fontStyle: 'normal' }}>
            {request.description}
          </div>
        </div>
      )}

      {request.location && !noMap && longMap && (
        <div className={LONG_MAP_WRAPPER_STYLE}>
          <img
            className={`${MAP_IMG_STYLE.toString()} br br-a150`}
            src={makeMapboxUrl(publicRuntimeConfig, request, 1000, 220)}
            alt={`Map of ${request.address || ''}`}
          />
          <div
            className={`${WAYPOINT_STYLE.toString()}`}
            dangerouslySetInnerHTML={{ __html: waypointIcon.html || '' }}
          />
        </div>
      )}

      <div className="g m-v400">
        {request.location && !noMap && !longMap && (
          <div className="g--6">
            <div className={`${SQUARE_MAP_WRAPPER_STYLE.toString()} m-b500`}>
              <img
                className={`${IMG_STYLE.toString()} ${MAP_IMG_STYLE.toString()} br br-a150`}
                src={makeMapboxUrl(publicRuntimeConfig, request, 440, 440)}
                alt={`Map of ${request.address || ''}`}
              />
              <div
                className={`${WAYPOINT_STYLE.toString()}`}
                dangerouslySetInnerHTML={{ __html: waypointIcon.html || '' }}
              />
            </div>
          </div>
        )}

        {request.images.length > 0 &&
          request.images.map(img => (
            <div
              className={request.images.length < 3 ? 'g--6' : 'g--4'}
              key={img.originalUrl}
            >
              <a
                href={img.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${IMG_WRAPPER_STYLE.toString()} br br-a150 m-b500`}
              >
                <img
                  className={`${IMG_STYLE.toString()}`}
                  alt={
                    img.tags.join(', ') ||
                    'Photo describing request or resolution'
                  }
                  src={img.squarePreviewUrl}
                />

                {img.tags.length > 0 && (
                  <div
                    className={`${IMG_LABEL_STYLE.toString()} p-a300 t--subtitle tt-u`}
                  >
                    {img.tags
                      .map(tag => HUMANIZED_TAG_NAMES[tag] || tag)
                      .join(', ')}
                  </div>
                )}
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}

CaseView.defaultProps = {
  submitted: false,
  noMap: false,
};
