import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { LoadServiceVariables, LoadService } from './types';

const QUERY = gql`
  query LoadService($code: String!) {
    service(code: $code) {
      name
      description
      code
      contactRequirement
      locationRequirement
      attributes {
        required
        type
        code
        description
        values {
          key
          name
        }
        validations {
          dependentOn {
            clause
            conditions {
              attribute
              op
              value {
                type
                string
                array
                number
              }
            }
          }
          message
          reportOnly
        }
        conditionalValues {
          dependentOn {
            clause
            conditions {
              attribute
              op
              value {
                type
                string
                array
                number
              }
            }
          }
          values {
            key
            name
          }
        }
        dependencies {
          clause
          conditions {
            attribute
            op
            value {
              type
              string
              array
              number
            }
          }
        }
      }
    }
  }
`;

/**
 * Loads a single Service instance, with information about what questions are
 * defined for requests to that service, whether contact/location info is
 * required, &c.
 */
export default async function loadService(
  fetchGraphql: FetchGraphql,
  code: string
) {
  const queryVariables: LoadServiceVariables = { code };
  const response: LoadService = await fetchGraphql(
    QUERY,
    queryVariables,
    `LoadService-${code}`
  );
  return response.service;
}
