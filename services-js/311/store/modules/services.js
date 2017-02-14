// @flow

import { handle } from 'redux-pack';
import type { Deps } from '../';
import ServicesLoadGraphql from './graphql/ServicesLoad.graphql';
import ServicesLoadMetadataGraphql from './graphql/ServicesLoadMetadata.graphql';
import type { ServicesLoadMetadataQuery, ServicesLoadMetadataQueryVariables } from './graphql/schema.flow';

// TODO(finh): extract from ServicesLoadQuery when
// https://github.com/facebook/flow/issues/3379 is resolved
export type Service = {
  code: string,
  name: string,
  hasMetadata: boolean,
};

export type ServiceMetadata = $PropertyType<ServicesLoadMetadataQuery, 'serviceMetadata'>;

export type Action =
  {| type: 'SERVICES_LOAD', payload: any |} |
  {| type: 'SERVICES_LOAD_METADATA', payload: any, meta: { code: string } |};

export type State = {
  services: ?Service[],
  servicesError: ?Object,
  serviceMetadata: {[key: string]: ServiceMetadata | Error | null}
};

export const loadServices = () => ({ loopbackGraphql }: Deps) => ({
  type: 'SERVICES_LOAD',
  promise: loopbackGraphql(ServicesLoadGraphql),
});

export const loadServiceMetadata = (code: string) => ({ loopbackGraphql }: Deps) => ({
  type: 'SERVICES_LOAD_METADATA',
  promise: loopbackGraphql(ServicesLoadMetadataGraphql, ({
    code,
  }: ServicesLoadMetadataQueryVariables)),
  meta: {
    code,
  },
});

const DEFAULT_STATE = {
  services: null,
  servicesError: null,
  serviceMetadata: {},
};

export default function reducer(state: State = DEFAULT_STATE, action: Action): State {
  switch (action.type) {
    case 'SERVICES_LOAD': {
      const { payload } = action;
      return handle(state, action, {
        success: (s) => ({ ...s, services: payload.services, servicesError: null }),
        failure: (s) => ({ ...s, services: null, servicesError: payload }),
      });
    }

    case 'SERVICES_LOAD_METADATA': {
      const { payload, meta } = action;
      return handle(state, action, {
        success: (s) => ({ ...s, serviceMetadata: { ...s.serviceMetadata, [meta.code]: payload } }),
        failure: (s) => ({ ...s, serviceMetadata: { ...s.serviceMetadata, [meta.code]: payload } }),
      });
    }

    default:
      return state;
  }
}
