import 'isomorphic-fetch';
import { RequestAdditions } from '../../server/lib/request-additions';

type QueryVariables = { [key: string]: any };

export type LoopbackGraphql = (
  query: string,
  variables?: QueryVariables
) => Promise<any>;

const makeGraphQLError = (message, errors) => {
  if (!message) {
    message = `${errors.map(e => e.message).join(', ')}`;
  }

  const e: any = new Error(message);
  e.errors = errors;
  // If the server needed to send this to Opbeat it would have, so we don't have
  // to on the client.
  e._reportedException = true;
  return e;
};

/**
 * Given a bit that's true if the response was a 200, and a parsed JSON
 * representation of the response body, either returns the GraphQL
 * response (from the "data" key) or throws an exception with the
 * GraphQL errors attached.
 */
function handleGraphqlResponse(ok, json) {
  if (ok && !json.errors) {
    return json.data;
  } else {
    throw makeGraphQLError(json.message, json.errors);
  }
}

async function clientGraphqlFetch(query: string, variables?: QueryVariables) {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // eslint-disable-next-line no-underscore-dangle
      'X-API-KEY': (window as any).__NEXT_DATA__.webApiKey,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (res.ok) {
    // only assume we can json if the response is ok
    return handleGraphqlResponse(true, await res.json());
  } else {
    throw new Error(await res.text());
  }
}

async function serverGraphqlFetch(hapiInject, query, variables = null) {
  const res = await hapiInject({
    url: '/graphql',
    method: 'post',
    headers: {
      'X-API-KEY': process.env.WEB_API_KEY || '',
    },
    payload: {
      query,
      variables,
    },
  });

  const json =
    typeof res.result === 'string' ? JSON.parse(res.result) : res.result;
  return handleGraphqlResponse(res.statusCode === 200, json);
}

function serverRenderGraphqlFetch(): Promise<any> {
  throw new Error(
    'loopbackGraphql not defined for server render. Fetch your data in getInitialProps() methods.'
  );
}

/**
 * req is the Node request, if we’re server-side rendering. It is expected
 * to have a "hapiInject" function attached to it to inject a request into
 * the Hapi server.
 *
 * Returns an async function from GraphQL query string and optional variables hash
 * to the response data from the local GraphQL server.
 */
export default function makeLoopbackGraphql(
  req: RequestAdditions | null
): LoopbackGraphql {
  if ((process as any).browser) {
    return clientGraphqlFetch;
  } else if (req) {
    return serverGraphqlFetch.bind(null, req.hapiInject);
  } else {
    // This case comes up when components make a loopbackGraphql outside of
    // getInitialProps but during server rendering. We don't error immediately
    // because the same codepath will run on the client, but we will error if
    // the component tries to perform a fetch during server rendering.
    return serverRenderGraphqlFetch;
  }
}
