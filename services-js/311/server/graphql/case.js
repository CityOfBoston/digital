// @flow

import moment from 'moment-timezone';

import type { ServiceStub } from './service';
import type {
  ServiceRequest,
  DetailedServiceRequest,
} from '../services/Open311';
import type { IndexedCase } from '../services/Elasticsearch';

export type Root = ServiceRequest | DetailedServiceRequest | IndexedCase;

export const Schema = `
type Case {
  id: String!
  service: Service!
  description: String
  status: String!
  statusNotes: String
  address: String
  images: [CaseImage!]!
  location: LatLng
  requestedAt: Int!
  updatedAt: Int!
  requestedAtString(format: String): String!
  updatedAtString(format: String): String!
  requestedAtRelativeString: String!
  updatedAtRelativeString: String!
}

type CaseImage {
  tags: [String!]!
  squareThumbnailUrl: String!
  squarePreviewUrl: String!
  originalUrl: String!
}
`;

export type CaseImage = {
  tags: Array<string>,
  squareThumbnailUrl: string,
  squarePreviewUrl: string,
  originalUrl: string,
};

type DateStringArguments = {
  format?: string,
};

function makeHttpsImageUrl(mediaUrl: string): string {
  return (mediaUrl || '')
    .trim()
    .replace(
      'http://boston.spot.show/',
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

export const resolvers = {
  Case: {
    id: (r: Root) => r.service_request_id,
    service: (r: Root): ServiceStub => ({
      service_name: r.service_name || '',
      service_code: r.service_code || 'UNKNOWN',
    }),
    description: (r: Root) => r.description || '',
    status: (r: Root) => r.status,
    statusNotes: (r: Root) => r.status_notes || null,
    address: (r: Root) => r.address,
    images: (r: Root): Array<CaseImage> => {
      if (!r.media_url) {
        return [];
      } else if (Array.isArray(r.media_url)) {
        return r.media_url.map(i => ({
          tags: i.tags,
          ...makeResizedImageUrls(i.url),
        }));
      } else {
        return [
          {
            tags: [],
            ...makeResizedImageUrls(r.media_url),
          },
        ];
      }
    },
    location: (r: Root) => {
      if (r.lat != null && r.long != null) {
        return { lat: r.lat, lng: r.long };
      } else if (r.location) {
        return { lat: r.location.lat, lng: r.location.lon };
      } else {
        return null;
      }
    },
    requestedAt: (r: Root) => moment(r.requested_datetime).unix(),
    updatedAt: (r: Root) =>
      moment(r.updated_datetime || r.requested_datetime).unix(),
    // We format timezones on the server to avoid having to ship moment to the client
    requestedAtString: (r: Root, { format = '' }: DateStringArguments) =>
      moment(r.requested_datetime).tz('America/New_York').format(format),
    updatedAtString: (r: Root, { format = '' }: DateStringArguments) =>
      moment(r.updated_datetime || r.requested_datetime)
        .tz('America/New_York')
        .format(format),
    requestedAtRelativeString: (r: Root) =>
      moment(r.requested_datetime).fromNow(),
    updatedAtRelativeString: (r: Root) => moment(r.updated_datetime).fromNow(),
  },
};
