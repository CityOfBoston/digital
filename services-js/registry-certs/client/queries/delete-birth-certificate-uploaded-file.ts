import { gql, FetchGraphql } from '@cityofboston/next-client-common';

import {
  DeleteBirthCertificateUploadedFile,
  DeleteBirthCertificateUploadedFileVariables,
} from './graphql-types';

const QUERY = gql`
  mutation DeleteBirthCertificateUploadedFile(
    $attachmentKey: String!
    $uploadSessionId: String!
  ) {
    deleteUpload(
      type: BC
      attachmentKey: $attachmentKey
      uploadSessionID: $uploadSessionId
    ) {
      message
      success
    }
  }
`;

export default async function deleteBirthCertificateUploadedFile(
  fetchGraphql: FetchGraphql,
  uploadSessionId: string,
  attachmentKey: string
) {
  const queryVariables: DeleteBirthCertificateUploadedFileVariables = {
    uploadSessionId,
    attachmentKey,
  };

  const response: DeleteBirthCertificateUploadedFile = await fetchGraphql(
    QUERY,
    queryVariables
  );

  return response.deleteUpload;
}
