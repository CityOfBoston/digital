// @flow

import moment from 'moment-timezone';

import type { ServiceStub } from './service';
import type { ServiceRequest } from '../services/Open311';

export type Root = ServiceRequest;

export const Schema = `
type Request {
  id: String!
  service: Service!
  description: String
  status: String!
  statusNotes: String
  address: String
  mediaUrl: String
  location: LatLng
  requestedAt: Int!
  updatedAt: Int!
  requestedAtString(format: String): String!
  updatedAtString(format: String): String!
  requestedAtRelativeString: String!
  updatedAtRelativeString: String!
}
`;

type DateStringArguments = {
  format?: string,
};

export const resolvers = {
  Request: {
    id: (r: Root) => r.service_request_id,
    service: (r: Root): ServiceStub => ({
      service_name: r.service_name || '',
      service_code: r.service_code,
    }),
    description: (r: Root) => r.description || '',
    status: (r: Root) => r.status,
    statusNotes: (r: Root) => r.status_notes || null,
    address: (r: Root) => r.address,
    mediaUrl: (r: Root) => (r.media_url || '').trim(),
    location: (r: Root) =>
      r.lat != null && r.long != null ? { lat: r.lat, lng: r.long } : null,
    requestedAt: (r: Root) => moment(r.requested_datetime).unix(),
    updatedAt: (r: Root) => moment(r.updated_datetime).unix(),
    // We format timezones on the server to avoid having to ship moment to the client
    requestedAtString: (r: Root, { format = '' }: DateStringArguments) =>
      moment(r.requested_datetime).tz('America/New_York').format(format),
    updatedAtString: (r: Root, { format = '' }: DateStringArguments) =>
      moment(r.updated_datetime).tz('America/New_York').format(format),
    requestedAtRelativeString: (r: Root) =>
      moment(r.requested_datetime).fromNow(),
    updatedAtRelativeString: (r: Root) => moment(r.updated_datetime).fromNow(),
  },
};
