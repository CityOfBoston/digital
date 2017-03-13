// @flow

import moment from 'moment-timezone';

import type { Context } from '.';
import type { ServiceRequest } from '../services/Open311';

export type Root = ServiceRequest;

export const Schema = `
type Request {
  id: String!
  service: Service!
  description: String
  status: String!
  address: String
  requestedAt: Int!
  updatedAt: Int!
  requestedAtString(format: String): String!
  updatedAtString(format: String): String!
}
`;

type DateStringArguments = {
  format?: string,
}

export const resolvers = {
  Request: {
    id: (r: ServiceRequest) => r.service_request_id,
    // TODO(finneganh): Could try to use service_code, service_name and avoid the
    // API call in some cases.
    service: (r: ServiceRequest, args: mixed, { open311 }: Context) => open311.service(r.service_code),
    description: (r: ServiceRequest) => r.description,
    status: (r: ServiceRequest) => r.status,
    address: (r: ServiceRequest) => r.address,
    requestedAt: (r: ServiceRequest) => moment(r.requested_datetime).unix(),
    updatedAt: (r: ServiceRequest) => moment(r.updated_datetime).unix(),
    // We format timezones on the server to avoid having to ship moment to the client
    requestedAtString: (r: ServiceRequest, { format = '' }: DateStringArguments) => moment(r.requested_datetime).tz('America/New_York').format(format),
    updatedAtString: (r: ServiceRequest, { format = '' }: DateStringArguments) => moment(r.updated_datetime).tz('America/New_York').format(format),
  },
};
