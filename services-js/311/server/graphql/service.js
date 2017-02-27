// @flow

import type { Service, ServiceMetadata, ServiceMetadataAttribute } from '../services/Open311';
import type { Context } from '.';

export const Schema = `
type Service {
  code: String!
  name: String!
  locationRequired: Boolean!
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
  name: String!
}

enum ServiceMetadataAttributeDatatype {
  BOOLEAN_CHECKBOX
  INFORMATIONAL
  MULTIVALUELIST
  NUMBER
  DATETIME
  SINGLEVALUELIST
  STRING
  TEXT
}
`;

export type Root = Service;

// TODO(finh): Either support this with authorization or delete Salesforce code
const USE_SALESFORCE = false;

export const resolvers = {
  Service: {
    code: (s: Service) => s.service_code,
    name: (s: Service) => s.service_name || '',
    locationRequired: async (s: Service, args: mixed, { salesforce }: Context) => {
      if (USE_SALESFORCE) {
        const serviceVersion = await salesforce.serviceVersion(s.service_code);
        if (!serviceVersion) {
          throw new Error(`Salesforce had no record for code ${s.service_code}`);
        }
        return serviceVersion.Incap311__Service_Location_Required__c;
      } else {
        return true;
      }
    },
    hasMetadata: (s: Service) => s.metadata,
    metadata: (s: Service, args: mixed, { open311 }: Context): ?Promise<ServiceMetadata> => (
      s.metadata ? open311.serviceMetadata(s.service_code) : null
    ),
  },

  ServiceMetadata: {
    attributes: (m: ServiceMetadata): ServiceMetadataAttribute[] => m.attributes,
  },

  ServiceMetadataAttribute: {
    type: (a: ServiceMetadataAttribute) => a.datatype.toUpperCase().replace(' ', '_').replace(/[()]/g, ''),
    required: (a: ServiceMetadataAttribute) => a.required,
    order: (a: ServiceMetadataAttribute) => a.order,
    code: (a: ServiceMetadataAttribute) => a.code,
    description: (a: ServiceMetadataAttribute) => a.description,
    values: (a: ServiceMetadataAttribute): null | {| key: string, name: string |}[] => a.values || null,
  },

  // Just using the default key / value resolvers
  ServiceMetadataAttributeValue: {},
};
