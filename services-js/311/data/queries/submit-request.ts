import { Service } from '../types';
import Question from '../store/Question';
import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { SubmitCaseVariables, SubmitCase } from './types';

const QUERY = gql`
  mutation SubmitCase(
    $code: String!
    $description: String!
    $descriptionForClassifier: String!
    $firstName: String
    $lastName: String
    $email: String
    $phone: String
    $address: String
    $addressId: String
    $location: LatLngIn
    $mediaUrl: String
    $attributes: [CreateCaseAttribute!]!
  ) {
    createCase(
      code: $code
      description: $description
      descriptionForClassifier: $descriptionForClassifier
      firstName: $firstName
      lastName: $lastName
      email: $email
      phone: $phone
      address: $address
      addressId: $addressId
      location: $location
      attributes: $attributes
      mediaUrl: $mediaUrl
    ) {
      id
      service {
        name
        code
      }
      status
      serviceNotice
      closureReason
      closureComment
      description
      address
      location {
        lat
        lng
      }
      images {
        tags
        originalUrl
        squarePreviewUrl
      }
      requestedAtString(format: "MMMM D, YYYY, h:mm A")
      updatedAtString(format: "MMMM D, YYYY, h:mm A")
      expectedAtString(format: "dddd, MMMM D, YYYY")
    }
  }
`;

type Args = {
  service: Service;
  description: string;
  descriptionForClassifier: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: { lat: number; lng: number } | null;
  address: string | null;
  addressId: string | null;
  questions: Question[];
  mediaUrl: string;
};

/**
 * Submits a new request to the backend based on the given arguments. These are taken from Store but are split out to clarify what values are necessary.
 *
 * Only submits valid values for the questions.
 */
export default async function submitCase(
  fetchGraphql: FetchGraphql,
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
) {
  const attributes: SubmitCaseVariables['attributes'] = [];

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

  const vars: SubmitCaseVariables = {
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

  const mutation: SubmitCase = await fetchGraphql(QUERY, vars);
  return mutation.createCase;
}
