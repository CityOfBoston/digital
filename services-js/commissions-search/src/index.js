/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/ie11'; // For IE 11 support

import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';

let inferredVersion = 'd7';

// Outside of a Drupal environment, create a mock Drupal object
// eslint-disable-next-line no-use-before-define
if (
  typeof window.Drupal === 'undefined' &&
  typeof window.drupalSettings === 'undefined'
) {
  window.Drupal = {
    settings: {
      bos_commissions_search: {
        bos_commissions_search_graphql_api_key: null,
        bos_commissions_search_graphql_endpoint:
          'https://commissions-app.digital-staging.boston.gov/commissions/graphql',
      },
    },
  };
}

if (window.drupalSettings) {
  inferredVersion = 'd8';
}

/**
 * Returns an options object with the correct paths to Drupal’s settings,
 * based on the current version.
 * https://github.com/CityOfBoston/digital/issues/222
 *
 * @param {'d7' | 'd8'} drupalVersion
 * @returns {{headers: {'x-api-key': *, 'content-type': string, accept: string}, uri: *}}
 */
function httpLinkOptions(drupalVersion) {
  const endpoint =
    drupalVersion === 'd8'
      ? window.drupalSettings.bos_commissions.bos_commissions_search
          .graphql_endpoint
      : window.Drupal.settings.bos_commissions_search
          .bos_commissions_search_graphql_endpoint;

  const apiKey =
    drupalVersion === 'd8'
      ? window.drupalSettings.bos_commissions.bos_commissions_search.api_key
      : window.Drupal.settings.bos_commissions_search
          .bos_commissions_search_graphql_api_key;

  return {
    uri: endpoint,
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'x-api-key': apiKey,
    },
  };
}

function ApolloWrapperComponent() {
  const client = new ApolloClient({
    link: new createHttpLink(httpLinkOptions(inferredVersion)),
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

ReactDOM.render(<ApolloWrapperComponent />, document.getElementById('root'));
/* eslint-enable no-unused-vars */
