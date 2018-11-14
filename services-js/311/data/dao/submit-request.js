// @flow

import type { Service, SubmittedRequest } from '../types';
import type Question from '../store/Question';
import type { LoopbackGraphql } from './loopback-graphql';
import type {
  SubmitCaseMutationVariables,
  SubmitCaseMutation,
} from './graphql/types';
import SubmitCaseGraphql from './graphql/SubmitCase.graphql';

type Args = {|
  service: Service,
  description: string,
  descriptionForClassifier: string,
  firstName: ?string,
  lastName: ?string,
  email: ?string,
  phone: ?string,
  location: ?{| lat: number, lng: number |},
  address: ?string,
  addressId: ?string,
  questions: Question[],
  mediaUrl: string,
|};

// Submits a new request to the backend based on the given arguments. These
// are taken from Store but are split out to clarify what values are necessary.
//
// Only submits valid values for the questions.
export default async function submitCase(
  loopbackGraphql: LoopbackGraphql,
  {
    service,
    description,
    descriptionForClassifier,
    mediaUrl,
    firstName,
    lastName,
    email,
    phone,
    address,
    addressId,
    location,
    questions,
  }: Args
): Promise<SubmittedRequest> {
  const attributes = [];

  questions.forEach(({ code, safeValue }) => {
    // null takes into account question visibility
    if (safeValue == null) {
      return;
    }

    if (Array.isArray(safeValue)) {
      // Format for MULTIVALUELIST questions is to repeat the key in several
      // key/value pairs.
      safeValue.forEach(v => {
        attributes.push({ code, value: v });
      });
    } else {
      attributes.push({ code, value: safeValue });
    }
  });

  const vars: SubmitCaseMutationVariables = {
    code: service.code,
    description,
    descriptionForClassifier,
    firstName,
    lastName,
    email,
    phone,
    location,
    address,
    addressId,
    mediaUrl,
    attributes,
  };

  const mutation: SubmitCaseMutation = await loopbackGraphql(
    SubmitCaseGraphql,
    vars
  );
  return mutation.createCase;
}
