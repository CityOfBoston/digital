import { ResolvableWith, Resolvers } from '@cityofboston/graphql-typescript';

import {
  Service as Open311Service,
  ServiceMetadata,
  ServiceMetadataAttribute,
  PlainValue,
  ConditionalValues,
  Validation,
  DependentConditions,
  DependentCondition,
  isPlainValue,
  isConditionalValues,
} from '../services/Open311';

import { Context } from '.';

/**
 * This type can be generated from the data in a ServiceRequest, so if you only
 * need the name / type of a case’s Service we don’t need to do an additional
 * lookup.
 */
export interface ServiceStub {
  __type: 'ServiceStub';
  service_name: string;
  service_code: string;
}

export type ServiceRoot = Open311Service | ServiceStub;

function isServiceStub(s: ServiceRoot): s is ServiceStub {
  return (s as ServiceStub).__type === 'ServiceStub';
}

export interface Service extends ResolvableWith<ServiceRoot> {
  code: string;
  name: string;
  description: string | null;
  group: string | null;
  attributes: ServiceAttribute[];
  locationRequirement: MetadataRequirement;
  contactRequirement: MetadataRequirement;
  locationRequired: boolean;
  contactRequired: boolean;
}

enum MetadataRequirement {
  REQUIRED = 'REQUIRED',
  VISIBLE = 'VISIBLE',
  HIDDEN = 'HIDDEN',
}

// Much of the below is rewrites of Open311 types in order to get names we like,
// since it was convenient to just send the Open311 JSON down as the GraphQL
// response for the attribute language.

enum ServiceAttributeDatatype {
  BOOLEAN_CHECKBOX = 'BOOLEAN_CHECKBOX',
  INFORMATIONAL = 'INFORMATIONAL',
  MULTIVALUELIST = 'MULTIVALUELIST',
  NUMBER = 'NUMBER',
  DATETIME = 'DATETIME',
  DATE = 'DATE',
  SINGLEVALUELIST = 'SINGLEVALUELIST',
  STRING = 'STRING',
  TEXT = 'TEXT',
}

enum ServiceAttributeConditionalClause {
  AND = 'AND',
  OR = 'OR',
}

enum ServiceAttributeConditionalOp {
  eq = 'eq',
  neq = 'neq',
  in = 'in',
  gt = 'gt',
  gte = 'gte',
  lt = 'lt',
  lte = 'lte',
}

enum ServiceAttributeConditionValueType {
  STRING = 'STRING',
  STRING_ARRAY = 'STRING_ARRAY',
  NUMBER = 'NUMBER',
}

interface ServiceAttributeValue extends ResolvableWith<PlainValue> {
  key: string;
  name: string;
}

interface ServiceAttributeConditionValue {
  type: ServiceAttributeConditionValueType;
  string: string | null;
  array: string[] | null;
  number: number | null;
}

interface ServiceAttributeCondition extends ResolvableWith<DependentCondition> {
  attribute: string;
  op: ServiceAttributeConditionalOp;
  value: ServiceAttributeConditionValue;
}

interface ServiceAttributeConditional
  extends ResolvableWith<DependentConditions> {
  clause: ServiceAttributeConditionalClause;
  conditions: ServiceAttributeCondition[];
}

interface ServiceAttributeConditionalValues
  extends ResolvableWith<ConditionalValues> {
  dependentOn: ServiceAttributeConditional;
  values: ServiceAttributeValue[];
}

interface ServiceAttributeValidation extends ResolvableWith<Validation> {
  dependentOn: ServiceAttributeConditional;
  message: string;
  reportOnly: boolean;
}

interface ServiceAttribute extends ResolvableWith<ServiceMetadataAttribute> {
  type: ServiceAttributeDatatype;
  required: boolean;
  description: string;
  code: string;
  dependencies: ServiceAttributeConditional | null;
  validations: ServiceAttributeValidation[];
  values: ServiceAttributeValue[] | null;
  conditionalValues: ServiceAttributeConditionalValues[] | null;
}

/**
 * Wraps a metadata -> T function with a call to load the metadata from Open311.
 * The Open311 serviceMetadata method uses a DataLoader loader, so multiple
 * calls to this in the same tick will result in just one network request.
 */
function makeMetadataResolver<T>(cb: (metadata: ServiceMetadata | null) => T) {
  return async (
    { service_code }: ServiceRoot,
    _args: unknown,
    { open311 }: Context
  ) => cb(await open311.serviceMetadata(service_code));
}

function resolveMetadataRequirement(
  metadata: ServiceMetadata | null,
  definitionKey: string,
  requiredKey: string
): MetadataRequirement {
  if (!metadata) {
    return MetadataRequirement.REQUIRED;
  }

  const { definitions } = metadata;
  if (!definitions) {
    return MetadataRequirement.REQUIRED;
  }

  const definition: { required: boolean; visible: boolean } | undefined =
    definitions[definitionKey];
  const required: boolean | undefined = definitions[requiredKey];

  if (definition) {
    if (definition.required) {
      return MetadataRequirement.REQUIRED;
    } else if (definition.visible) {
      return MetadataRequirement.VISIBLE;
    } else {
      return MetadataRequirement.HIDDEN;
    }
  } else if (required) {
    return MetadataRequirement.REQUIRED;
  } else {
    return MetadataRequirement.VISIBLE;
  }
}

const serviceResolvers: Resolvers<Service, Context> = {
  code: ({ service_code }) => service_code,
  name: ({ service_name }) => service_name || '',

  description: async (r, _, { open311 }) =>
    (isServiceStub(r) ? (await open311.service(r.service_code))! : r)
      .description,
  group: async (r, _, { open311 }) =>
    (isServiceStub(r) ? (await open311.service(r.service_code))! : r).group,

  attributes: makeMetadataResolver(metadata =>
    metadata ? metadata.attributes : []
  ),

  locationRequired: makeMetadataResolver(
    metadata =>
      resolveMetadataRequirement(metadata, 'location', 'location_required') ===
      'REQUIRED'
  ),

  locationRequirement: makeMetadataResolver(metadata =>
    resolveMetadataRequirement(metadata, 'location', 'location_required')
  ),

  contactRequired: makeMetadataResolver(
    metadata =>
      resolveMetadataRequirement(metadata, 'reporter', 'contact_required') ===
      'REQUIRED'
  ),

  contactRequirement: makeMetadataResolver(metadata =>
    resolveMetadataRequirement(metadata, 'reporter', 'contact_required')
  ),
};

const serviceAttributeResolvers: Resolvers<ServiceAttribute, Context> = {
  required: ({ required }) => required,
  description: ({ description }) => description,
  code: ({ code }) => code,

  type: a =>
    a.datatype
      .toUpperCase()
      .replace(' ', '_')
      .replace(/[()]/g, '') as ServiceAttributeDatatype,

  values: ({ values }) =>
    Array.isArray(values) ? values.filter(isPlainValue) : null,

  conditionalValues: ({ values }) =>
    Array.isArray(values) ? values.filter(isConditionalValues) : null,

  // Safety to make sure we always have a dependentOn value.
  validations: ({ validations }): Validation[] =>
    (validations || []).filter(({ dependentOn }) => !!dependentOn),

  dependencies: ({ dependencies }) => dependencies || null,
};

const serviceAttributeConditionResolvers: Resolvers<
  ServiceAttributeCondition,
  Context
> = {
  attribute: ({ attribute }) => attribute,
  op: ({ op }) => op as ServiceAttributeConditionalOp,

  // getting around the polymorphism from the Open311 API. Our generated
  // Flow types don't handle unions very well, so we do a faux union by
  // just providing each of the types.
  value: ({ value }) => {
    if (Array.isArray(value)) {
      return {
        type: ServiceAttributeConditionValueType.STRING_ARRAY,
        string: null,
        array: value,
        number: null,
      };
    } else if (typeof value === 'number') {
      return {
        type: ServiceAttributeConditionValueType.NUMBER,
        string: null,
        array: null,
        number: value,
      };
    } else {
      return {
        type: ServiceAttributeConditionValueType.STRING,
        string: value,
        array: null,
        number: null,
      };
    }
  },
};

const serviceAttributeValidationResolvers: Resolvers<
  ServiceAttributeValidation,
  Context
> = {
  dependentOn: ({ dependentOn }) => dependentOn,
  message: ({ message }) => message || '',
  reportOnly: reportOnly => !!reportOnly,
};

export const resolvers = {
  Service: serviceResolvers,
  ServiceAttribute: serviceAttributeResolvers,
  ServiceAttributeCondition: serviceAttributeConditionResolvers,
  // Just using the default key / value resolvers
  ServiceAttributeValue: {},
  ServiceAttributeValidation: serviceAttributeValidationResolvers,
};
