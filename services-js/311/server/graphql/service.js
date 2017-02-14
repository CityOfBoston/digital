// @flow

import type { Service, ServiceMetadata, ServiceMetadataAttribute } from '../services/Open311';
import type { Context } from '.';

export const Schema = `
type Service {
  code: String!
  name: String!
  hasMetadata: Boolean!
  metadata: ServiceMetadata
}

type ServiceMetadata {
  attributes: [ServiceMetadataAttribute!]!
}

type ServiceMetadataAttribute {
  type: ServiceMetadataAttributeDatatype!
  required: Boolean!
  order: Int
  description: String!
  code: String!
  values: [ServiceMetadataAttributeValue!]
}

type ServiceMetadataAttributeValue {
  key: String!
  value: String!
}

enum ServiceMetadataAttributeDatatype {
  text
  informational
  picklist
}
`;

export const resolvers = {
  Service: {
    code: (s: Service) => s.service_code,
    name: (s: Service) => s.service_name,
    hasMetadata: (s: Service) => s.metadata,
    metadata: (s: Service, args: mixed, { open311 }: Context): ?Promise<ServiceMetadata> => (
      s.metadata ? open311.serviceMetadata(s.service_code) : null
    ),
  },

  ServiceMetadata: {
    attributes: (m: ServiceMetadata): ServiceMetadataAttribute[] => m.attributes,
  },

  ServiceMetadataAttribute: {
    type: (a: ServiceMetadataAttribute) => a.datatype.toLowerCase(),
    required: (a: ServiceMetadataAttribute) => a.required,
    order: (a: ServiceMetadataAttribute) => a.order,
    code: (a: ServiceMetadataAttribute) => a.code,
    description: (a: ServiceMetadataAttribute) => a.description,
    values: (a: ServiceMetadataAttribute): null | {| key: string, value: string |}[] => a.values || null,
  },

  // Just using the default key / value resolvers
  ServiceMetadataAttributeValue: {},
};
