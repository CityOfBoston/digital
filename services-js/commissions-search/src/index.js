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

// Outside of a Drupal environment create a mock Drupal object
// eslint-disable-next-line no-use-before-define
if (typeof window.Drupal === 'undefined') {
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

const client = new ApolloClient({
  link: new createHttpLink({
    uri:
      window.Drupal.settings.bos_commissions_search
        .bos_commissions_search_graphql_endpoint,
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'x-api-key':
        window.Drupal.settings.bos_commissions_search
          .bos_commissions_search_graphql_api_key,
    },
  }),
  cache: new InMemoryCache(),
});

function ApolloWrapperComponent() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

ReactDOM.render(<ApolloWrapperComponent />, document.getElementById('root'));
/* eslint-enable no-unused-vars */
