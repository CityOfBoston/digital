import { gql, FetchGraphql } from '@cityofboston/next-client-common';

import {
  DeleteDeathCertificateUploadedFile,
  DeleteDeathCertificateUploadedFileVariables,
} from './graphql-types';

const QUERY = gql`
  mutation DeleteDeathCertificateUploadedFile(
    $attachmentKey: String!
    $uploadSessionId: String!
  ) {
    deleteUpload(
      type: DC
      attachmentKey: $attachmentKey
      uploadSessionID: $uploadSessionId
    ) {
      message
      success
    }
  }
`;

export default async function deleteDeathCertificateUploadedFile(
  fetchGraphql: FetchGraphql,
  uploadSessionId: string,
  attachmentKey: string
) {
  const queryVariables: DeleteDeathCertificateUploadedFileVariables = {
    uploadSessionId,
    attachmentKey,
  };

  const response: DeleteDeathCertificateUploadedFile = await fetchGraphql(
    QUERY,
    queryVariables
  );

  return response.deleteUpload;
}
