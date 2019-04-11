import moment from 'moment-timezone';
import {
  ResolvableWith,
  Int,
  Resolvers,
} from '@cityofboston/graphql-typescript';

import { DetailedServiceRequest as Open311ServiceRequest } from '../services/Open311';
import { IndexedCase } from '../services/Elasticsearch';

import { Context } from '.';
import { ServiceStub, Service } from './service';
import { LatLng } from './query';

/**
 * We get a case either from Open311 or from our Elasticsearch index. They have
 * roughly the same data, so we want to re-use the resolvers between them.
 *
 * We call the field "request" because "case" is a reserved word.
 */
export type CaseRoot =
  | { source: 'Open311'; request: Open311ServiceRequest }
  | { source: 'Elasticsearch'; request: IndexedCase };

export interface Case extends ResolvableWith<CaseRoot> {
  id: string;
  service: Service;
  description: string | null;
  status: string;
  statusNotes: string | null;
  serviceNotice: string | null;
  closureReason: string | null;
  closureComment: string | null;
  address: string | null;
  images: CaseImage[];
  location: LatLng | null;
  requestedAt: Int | null;
  updatedAt: Int | null;
  expectedAt: Int | null;
  requestedAtString(args: { format?: string }): string | null;
  updatedAtString(args: { format?: string }): string | null;
  expectedAtString(args: { format?: string }): string | null;
  requestedAtRelativeString: string | null;
  updatedAtRelativeString: string | null;
  expectedAtRelativeString: string | null;
}

interface CaseImage {
  tags: string[];
  squareThumbnailUrl: string;
  squarePreviewUrl: string;
  originalUrl: string;
}

function makeHttpsImageUrl(mediaUrl: string): string {
  return (mediaUrl || '')
    .trim()
    .replace(
      'http://boston.spot.show/',
      'https://res.cloudinary.com/spot-boston/'
    )
    .replace(
      'http://spot-boston-res.cloudinary.com/',
      'https://spot-boston-res.cloudinary.com/'
    );
}

function makeResizedImageUrls(url: string) {
  url = makeHttpsImageUrl(url);
  const imagePathMatch = url.match(/^(https?:\/\/.*\/image\/upload)\/(.*)$/);

  if (!imagePathMatch) {
    return {
      originalUrl: url,
      squarePreviewUrl: url,
      squareThumbnailUrl: url,
    };
  } else {
    return {
      originalUrl: url,
      squarePreviewUrl: [
        imagePathMatch[1],
        't_large_square_preview',
        imagePathMatch[2],
      ].join('/'),
      squareThumbnailUrl: [
        imagePathMatch[1],
        't_square_thumbnail',
        imagePathMatch[2],
      ].join('/'),
    };
  }
}

function imagesFromMediaUrl(
  mediaUrl: Open311ServiceRequest['media_url'] | undefined
): CaseImage[] {
  if (!mediaUrl) {
    return [];
  } else if (Array.isArray(mediaUrl)) {
    return mediaUrl.map(i => ({
      tags: i.tags || [],
      ...makeResizedImageUrls(i.url),
    }));
  } else {
    return [
      {
        tags: [],
        ...makeResizedImageUrls(mediaUrl),
      },
    ];
  }
}

const caseResolvers: Resolvers<Case, Context> = {
  id: ({ request }) => request.service_request_id,
  service: ({ request }): ServiceStub => ({
    __type: 'ServiceStub',
    service_name: request.service_name || '',
    service_code: request.service_code || 'UNKNOWN',
  }),
  description: ({ request }) => request.description || '',
  status: ({ request }) => request.status,
  statusNotes: ({ request }) => request.status_notes || null,
  serviceNotice: caseRoot =>
    (caseRoot.source === 'Open311' && caseRoot.request.service_notice) || null,
  closureReason: caseRoot =>
    (caseRoot.source === 'Open311' &&
      caseRoot.request.closure_details.reason) ||
    null,
  closureComment: caseRoot =>
    (caseRoot.source === 'Open311' &&
      caseRoot.request.closure_details.comment) ||
    null,
  images: (caseRoot): CaseImage[] => {
    const caseImages = imagesFromMediaUrl(caseRoot.request.media_url);

    // Open311 cases may have images in the activities from being closed. The
    // Elasticsearch cases only have the media_url image.
    const activitiesImages =
      caseRoot.source === 'Open311'
        ? caseRoot.request.activities.map(({ media_url }) =>
            imagesFromMediaUrl(media_url)
          )
        : [];

    // Since the activities is an array of arrays, we use reduce to flatten
    // down to a single list of images.
    return [caseImages, ...activitiesImages].reduce(
      (arr, images) => [...arr, ...images],
      []
    );
  },
  address: ({ request }) => request.address || '',
  location: caseRoot => {
    switch (caseRoot.source) {
      case 'Elasticsearch':
        // Elasticsearch cases have the lat/lon in a "location" field because
        // that’s what’s required for use with Elasticsearch’s geo querying.
        return (
          caseRoot.request.location && {
            lat: caseRoot.request.location.lat,
            lng: caseRoot.request.location.lon,
          }
        );
      case 'Open311': {
        const { request } = caseRoot;

        if (
          request.reported_location &&
          request.reported_location.lat &&
          request.reported_location.long
        ) {
          // This is the lat/lng from the original submitter. It's preferred over
          // any other because it matches the submitter's intent.
          return {
            lat: request.reported_location.lat,
            lng: request.reported_location.long,
          };
        } else if (request.lat && request.long) {
          // Sometimes a lat/lng wasn't reported (e.g. just an address) so we use
          // the geocoded version from Salesforce.
          return { lat: request.lat, lng: request.long };
        } else {
          return null;
        }
      }
    }
  },
  requestedAt: ({ request }) =>
    request.requested_datetime
      ? moment(request.requested_datetime).unix()
      : null,
  updatedAt: ({ request }) => {
    // Some cases may not have an updated date, so fall back to the requested
    // one.
    const d = request.updated_datetime || request.requested_datetime;
    return d ? moment(d).unix() : null;
  },
  expectedAt: caseRoot =>
    caseRoot.source === 'Open311' && caseRoot.request.expected_datetime
      ? moment(caseRoot.request.expected_datetime).unix()
      : null,

  // We format timezones on the server to avoid having to ship moment to the client
  requestedAtString: async (caseRoot, { format = '' }, ctx) => {
    const requestedAt = await caseResolvers.requestedAt(caseRoot, {}, ctx);
    return requestedAt
      ? moment(requestedAt * 1000)
          .tz('America/New_York')
          .format(format)
      : null;
  },
  updatedAtString: async (caseRoot, { format = '' }, ctx) => {
    const updatedAt = await caseResolvers.updatedAt(caseRoot, {}, ctx);
    return updatedAt
      ? moment(updatedAt * 1000)
          .tz('America/New_York')
          .format(format)
      : null;
  },
  expectedAtString: async (caseRoot, { format = '' }, ctx) => {
    const expectedAt = await caseResolvers.expectedAt(caseRoot, {}, ctx);
    return expectedAt
      ? moment(expectedAt * 1000)
          .tz('America/New_York')
          .format(format)
      : null;
  },
  requestedAtRelativeString: async (caseRoot, _, ctx) => {
    const requestedAt = await caseResolvers.requestedAt(caseRoot, {}, ctx);
    return requestedAt ? moment(requestedAt * 1000).fromNow() : null;
  },
  updatedAtRelativeString: async (caseRoot, _, ctx) => {
    const updatedAt = await caseResolvers.updatedAt(caseRoot, {}, ctx);
    return updatedAt ? moment(updatedAt * 1000).fromNow() : null;
  },
  expectedAtRelativeString: async (caseRoot, _, ctx) => {
    const expectedAt = await caseResolvers.expectedAt(caseRoot, {}, ctx);
    return expectedAt ? moment(expectedAt * 1000).fromNow() : null;
  },
};

export const resolvers = {
  Case: caseResolvers,
};
