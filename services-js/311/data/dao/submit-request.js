// @flow

import type { Service, SubmittedRequest } from '../types';
import type Question from '../store/Question';
import type { ContactInfo, LocationInfo } from '../store/RequestForm';
import type { LoopbackGraphql } from './loopback-graphql';
import type { SubmitRequestMutationVariables, SubmitRequestMutation } from './graphql/types';
import SubmitRequestGraphql from './graphql/SubmitRequest.graphql';

type Args = {|
  service: Service,
  description: string,
  contactInfo: ?ContactInfo,
  locationInfo: LocationInfo,
  questions: Question[],
  mediaUrl: string,
|};

// Submits a new request to the backend based on the given arguments. These
// are taken from Store but are split out to clarify what values are necessary.
//
// Only submits valid values for the questions.
export default async function submitRequest(loopbackGraphql: LoopbackGraphql, {
  service,
  description,
  mediaUrl,
  contactInfo,
  locationInfo,
  questions,
}: Args): Promise<SubmittedRequest> {
  const attributes = [];

  questions.forEach(({ code, validatedValue }) => {
    // null takes into account question visibility
    if (validatedValue == null) {
      return;
    }

    if (Array.isArray(validatedValue)) {
      // Format for MULTIVALUELIST questions is to repeat the key in several
      // key/value pairs.
      validatedValue.forEach((v) => { attributes.push({ code, value: v }); });
    } else {
      attributes.push({ code, value: validatedValue });
    }
  });

  const vars: SubmitRequestMutationVariables = {
    code: service.code,
    description,
    firstName: contactInfo ? contactInfo.firstName : '',
    lastName: contactInfo ? contactInfo.lastName : '',
    email: contactInfo ? contactInfo.email : '',
    phone: contactInfo ? contactInfo.phone : '',
    location: locationInfo.location,
    address: locationInfo.address,
    mediaUrl,
    attributes,
  };

  const mutation: SubmitRequestMutation = await loopbackGraphql(SubmitRequestGraphql, vars);
  return mutation.createRequest;
}
