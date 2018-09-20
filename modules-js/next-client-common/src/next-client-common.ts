import fetch from 'isomorphic-fetch';
import getConfig from 'next/config';
import { IncomingMessage, ServerResponse } from 'http';
import { ServerInjectResponse } from 'hapi';

export { default as RouterListener } from './RouterListener';
export * from './RouterListener';

export const API_KEY_CONFIG_KEY = 'graphqlApiKey';
export const HAPI_INJECT_CONFIG_KEY = 'graphqlHapiInject';
export const GRAPHQL_PATH_KEY = 'graphqlPath';

// We parameterize the Request type because it’s common to pass extra things
// into the server-side getInitialProps methods by attaching them as properties
// on the request. This is typically "IncomingMessage & CustomType"
export interface NextContext<Req> {
  query: { [key: string]: string };
  pathname: string;
  asPath: string;
  jsonPageRes?: Response;
  req?: Req;
  res?: ServerResponse;
  err: any;
}

export interface PublicRuntimeConfig {
  [API_KEY_CONFIG_KEY]: string;
  [GRAPHQL_PATH_KEY]: string;
}

export interface ServerRuntimeConfig {
  [HAPI_INJECT_CONFIG_KEY]: Function;
}

export interface RuntimeConfig {
  publicRuntimeConfig: PublicRuntimeConfig;
  serverRuntimeConfig: ServerRuntimeConfig;
}

export type QueryVariables = { [key: string]: any };

export interface GraphqlErrorRecord {
  message: string;
}

export interface GraphqlError extends Error {
  errors: GraphqlErrorRecord[];
  source: 'server' | null;
}

function makeGraphQLError(
  message: string | null | undefined,
  errors: GraphqlErrorRecord[] = []
): GraphqlError {
  if (!message) {
    message = `${errors.map(e => e.message).join(', ')}`;
  }

  const e = new Error(message) as GraphqlError;
  e.errors = errors;
  // We can use this as a signal to not send this error to an exception
  // reporting service, since the server would have already sent it.
  e.source = 'server';
  return e;
}

interface GraphqlJsonResponse<T> {
  data?: T;
  message?: string;
  errors?: GraphqlErrorRecord[];
}

/**
 * Given a bit that's true if the response was a 200, and a parsed JSON
 * representation of the response body, either returns the GraphQL
 * response (from the "data" key) or throws an exception with the
 * GraphQL errors attached.
 */
function handleGraphqlResponse<T>(
  ok: boolean,
  json: GraphqlJsonResponse<T>
): T {
  if (ok && !json.errors && json.data) {
    return json.data;
  } else {
    throw makeGraphQLError(json.message, json.errors);
  }
}

async function clientFetchGraphql<T>(
  { publicRuntimeConfig }: RuntimeConfig,
  query,
  variables: QueryVariables | null = null
): Promise<T> {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (publicRuntimeConfig && publicRuntimeConfig[API_KEY_CONFIG_KEY]) {
    headers['X-API-KEY'] = publicRuntimeConfig[API_KEY_CONFIG_KEY];
  }

  const res = await fetch(
    (publicRuntimeConfig && publicRuntimeConfig[GRAPHQL_PATH_KEY]) ||
      '/graphql',
    {
      method: 'POST',
      headers,
      // Needed because Hammerhead (used by TestCafe) can default to "omit", at
      // least on Chrome 62 (the version we get on Travis).
      credentials: 'same-origin',
      body: JSON.stringify({
        query,
        variables,
      }),
    }
  );

  if (res.ok) {
    // We do the res.ok check rather than passing it in so that we only call
    // res.json() on an OK repsonse.
    return handleGraphqlResponse<T>(true, await res.json());
  } else {
    throw new Error(await res.text());
  }
}

async function serverFetchGraphql<T>(
  { publicRuntimeConfig, serverRuntimeConfig }: RuntimeConfig,
  parentRequest: IncomingMessage | undefined,
  query: string,
  variables: QueryVariables | null
): Promise<T> {
  const headers = {};

  if (publicRuntimeConfig && publicRuntimeConfig[API_KEY_CONFIG_KEY]) {
    headers['X-API-KEY'] = publicRuntimeConfig[API_KEY_CONFIG_KEY];
  }

  if (!serverRuntimeConfig || !serverRuntimeConfig[HAPI_INJECT_CONFIG_KEY]) {
    throw new Error(
      `Hapi inject not found in server config at ${HAPI_INJECT_CONFIG_KEY}`
    );
  }

  if (parentRequest) {
    headers['Cookie'] = parentRequest.headers.cookie;
  }

  const hapiInject = serverRuntimeConfig[HAPI_INJECT_CONFIG_KEY];

  const res: ServerInjectResponse = await hapiInject({
    url:
      (publicRuntimeConfig && publicRuntimeConfig[GRAPHQL_PATH_KEY]) ||
      '/graphql',
    method: 'post',
    headers,
    payload: {
      query,
      variables,
    },
  });

  const json =
    typeof res.result === 'string' ? JSON.parse(res.result) : res.result;
  return handleGraphqlResponse<T>(res.statusCode === 200, json);
}

/**
 * Runs a GraphQL query against the local app, returning the parsed JSON result.
 *
 * Requries that the private NextJS configuration has Hapi's #inject function
 * set in the HAPI_INJECT_CONFIG_KEY value.
 *
 * Can also be configured to pass an X-API-KEY via the API_KEY_CONFIG_KEY public
 * config value.
 *
 * The GraphQL endpoint defaults to "/graphql" but can be set by the
 * GRAPHQL_PATH_KEY public config value.
 *
 * @param query GraphQL query string
 * @param variables Optional hash of variable values
 * @param parentRequest The HTTP request from server-side rendering. Used to
 * pass cookies along.
 *
 * @throws Error, GraphqlError
 */
export function fetchGraphql<T>(
  query: string,
  variables: QueryVariables | null = null
): Promise<T> {
  const runtimeConfig: RuntimeConfig = getConfig();

  if ((process as any).browser) {
    return clientFetchGraphql<T>(runtimeConfig, query, variables);
  } else {
    return serverFetchGraphql<T>(runtimeConfig, undefined, query, variables);
  }
}

export type FetchGraphql = (
  query: string,
  variables?: QueryVariables
) => Promise<any>;

export function makeFetchGraphql(
  runtimeConfig: RuntimeConfig,
  parentRequest?: IncomingMessage
): FetchGraphql {
  if ((process as any).browser) {
    return clientFetchGraphql.bind(null, runtimeConfig);
  } else {
    return serverFetchGraphql.bind(null, runtimeConfig, parentRequest);
  }
}

async function clientFetchJson<T>(
  path: string,
  init?: RequestInit | undefined
): Promise<T> {
  const res = await fetch(path, { credentials: 'same-origin', ...init });

  if (res.ok) {
    // We do the res.ok check rather than passing it in so that we only call
    // res.json() on an OK repsonse.
    return await res.json();
  } else {
    throw new Error(await res.text());
  }
}

async function serverFetchJson<T>(
  parentRequest: IncomingMessage | null,
  path: string,
  init?: RequestInit | undefined
): Promise<T> {
  if (!parentRequest) {
    throw new Error('parentRequest not sent in fetchJson');
  }
  init = init || {};

  const { serverRuntimeConfig } = getConfig();

  if (!serverRuntimeConfig || !serverRuntimeConfig[HAPI_INJECT_CONFIG_KEY]) {
    throw new Error(
      `Hapi inject not found in server config at ${HAPI_INJECT_CONFIG_KEY}`
    );
  }

  const hapiInject = serverRuntimeConfig[HAPI_INJECT_CONFIG_KEY];

  const headers = {
    cookie: parentRequest.headers.cookie,
    ...(init.headers || {}),
  };

  const res = await hapiInject({
    url: path,
    method: init.method || 'get',
    headers,
    payload: init.body,
  });

  if (res.statusCode !== 200) {
    throw new Error(res.result);
  }

  return typeof res.result === 'string' ? JSON.parse(res.result) : res.result;
}

export function fetchJson<T>(
  parentRequest: IncomingMessage | null,
  path: string,
  init?: RequestInit | undefined
): Promise<T> {
  if ((process as any).browser) {
    return clientFetchJson<T>(path, init);
  } else {
    return serverFetchJson<T>(parentRequest, path, init);
  }
}

/**
 * Passthrough tag just to mark GraphQL string literals so we can lint and
 * generate types from them.
 */
export function gql(
  literals: TemplateStringsArray,
  ...substitutions: string[]
) {
  const result: string[] = [];

  // run the loop only for the substitution count
  for (let i = 0; i < substitutions.length; i++) {
    result.push(literals[i]);
    result.push(substitutions[i]);
  }

  // add the last literal
  result.push(literals[literals.length - 1]);

  return result.join('');
}
