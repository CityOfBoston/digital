import { gql, FetchGraphql } from '@cityofboston/next-client-common';

import {
  DeleteMarriageCertificateUploadedFile,
  DeleteMarriageCertificateUploadedFileVariables,
} from './graphql-types';

const QUERY = gql`
  mutation DeleteMarriageCertificateUploadedFile(
    $attachmentKey: String!
    $uploadSessionId: String!
  ) {
    deleteUpload(
      type: MC
      attachmentKey: $attachmentKey
      uploadSessionID: $uploadSessionId
    ) {
      message
      success
    }
  }
`;

export default async function deleteMarriageCertificateUploadedFile(
  fetchGraphql: FetchGraphql,
  uploadSessionId: string,
  attachmentKey: string
) {
  const queryVariables: DeleteMarriageCertificateUploadedFileVariables = {
    uploadSessionId,
    attachmentKey,
  };

  const response: DeleteMarriageCertificateUploadedFile = await fetchGraphql(
    QUERY,
    queryVariables
  );

  return response.deleteUpload;
}
