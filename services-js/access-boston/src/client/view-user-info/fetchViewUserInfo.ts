import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { Identity } from './types';

const VIEW_USER_INFO_QUERY = gql`
  query ViewUserInfo($query_string: String!) {
    viewUserInfo(query_string: $query_string) {
      id
      uid
      legalFirstName
      legalLastName
      middleName
      preferredFirstName
      preferredLastName
      displayName
      email
      personalEmail
      workPhone
      phone
      manager
      departmentName
      location
      employmentStatus
      accountStatus
      identityState
      vpnStatus
      userRegistered
      passwordExpiresOn
      hireDate
      startDate
      isManager
      positionNumber
      jobCode
      isVip
      accounts {
        name
        disabled
      }
      isEmployee
      endDate
      sponsor
    }
  }
`;

export default async function fetchViewUserInfo(
  fetchGraphql: FetchGraphql,
  query_string: string
): Promise<Identity[]> {
  try {
    const response = await fetchGraphql(VIEW_USER_INFO_QUERY, { query_string });
    return response.viewUserInfo || [];
  } catch (error) {
    console.error('[fetchViewUserInfo] Caught error:', error);
    
    // GraphQL can return both errors and data
    // Try multiple ways to extract data from the error
    if (error && typeof error === 'object') {
      const errorObj = error as any;
      
      // Try different possible error structures (without optional chaining for older Babel)
      let possibleData = null;
      
      if (errorObj.data && errorObj.data.viewUserInfo) {
        possibleData = errorObj.data.viewUserInfo;
      } else if (errorObj.response && errorObj.response.data && errorObj.response.data.viewUserInfo) {
        possibleData = errorObj.response.data.viewUserInfo;
      } else if (errorObj.networkError && errorObj.networkError.result && errorObj.networkError.result.data && errorObj.networkError.result.data.viewUserInfo) {
        possibleData = errorObj.networkError.result.data.viewUserInfo;
      } else if (errorObj.graphQLErrors && errorObj.graphQLErrors[0] && errorObj.graphQLErrors[0].data && errorObj.graphQLErrors[0].data.viewUserInfo) {
        possibleData = errorObj.graphQLErrors[0].data.viewUserInfo;
      }
      
      if (possibleData && Array.isArray(possibleData)) {
        console.warn('[fetchViewUserInfo] GraphQL returned errors but data is present, using data. Errors:', 
          errorObj.graphQLErrors || errorObj.message);
        return possibleData;
      }
      
      // Log the full error structure for debugging
      console.error('[fetchViewUserInfo] Error structure:', {
        hasData: !!errorObj.data,
        hasResponse: !!errorObj.response,
        hasNetworkError: !!errorObj.networkError,
        hasGraphQLErrors: !!errorObj.graphQLErrors,
        keys: Object.keys(errorObj)
      });
    }
    
    // If no data available, re-throw the error
    console.error('[fetchViewUserInfo] No data found in error, re-throwing');
    throw error;
  }
}

