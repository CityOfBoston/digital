// submit-marriage-intention-certificate-order.ts

import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { MarriageIntentionCertificateOrderResult } from '../types';
import MarriageIntentionCertificateRequest from '../store/MarriageIntentionCertificateRequest';

const QUERY = gql`
  mutation SubmitMarriageIntentionCertificateOrder(
    $email: String!
    $dayPhone: String!
    $appointmentDate: String!
    $partnerA_firstName: String!
    $partnerA_lastName: String!
    $partnerA_middleName: String!
    $partnerA_suffix: String!
    $partnerA_surName: String!
    $partnerA_dob: String!
    $partnerA_age: String!
    $partnerA_occupation: String!
    $partnerA_sex: String!
    $partnerA_bloodRelation: String!
    $partnerA_bloodRelationDesc: String!
    $partnerA_parentsMarriedAtBirth: String!
    $partnerA_parentA_Name: String!
    $partnerA_parentB_Name: String!
    $partnerA_parentA_Surname: String!
    $partnerA_parentB_Surname: String!
    $partnerA_birthCity: String!
    $partnerA_birthState: String!
    $partnerA_birthCountry: String!
    $partnerA_birthHospital: String!
    $partnerA_partnershipType: String!
    $partnerA_partnershipTypeDissolved: String!
    $partnerA_partnershipState: String!
    $partnerA_residenceAddress: String!
    $partnerA_residenceCity: String!
    $partnerA_residenceState: String!
    $partnerA_residenceCountry: String!
    $partnerA_residenceZip: String!
    $partnerA_marriageNumb: String!
    $partnerA_lastMarriageStatus: String!
    $partnerB_firstName: String!
    $partnerB_lastName: String!
    $partnerB_middleName: String!
    $partnerB_suffix: String!
    $partnerB_surName: String!
    $partnerB_dob: String!
    $partnerB_age: String!
    $partnerB_occupation: String!
    $partnerB_sex: String!
    $partnerB_bloodRelation: String!
    $partnerB_bloodRelationDesc: String!
    $partnerB_parentsMarriedAtBirth: String!
    $partnerB_parentA_Name: String!
    $partnerB_parentB_Name: String!
    $partnerB_parentA_Surname: String!
    $partnerB_parentB_Surname: String!
    $partnerB_birthCity: String!
    $partnerB_birthState: String!
    $partnerB_birthCountry: String!
    $partnerB_birthHospital: String!
    $partnerB_partnershipType: String!
    $partnerB_partnershipTypeDissolved: String!
    $partnerB_partnershipState: String!
    $partnerB_residenceAddress: String!
    $partnerB_residenceCity: String!
    $partnerB_residenceState: String!
    $partnerB_residenceZip: String!
    $partnerB_residenceCountry: String!
    $partnerB_marriageNumb: String!
    $partnerB_lastMarriageStatus: String!
  ) {
    submitMarriageIntentionCertificateOrder(
      Email: $email
      DayPhone: $dayPhone
      AppointmentDate: $appointmentDate
      AApplicantFName: $partnerA_firstName
      AApplicantLName: $partnerA_lastName
      AApplicantMiddleName: $partnerA_middleName
      AApplicantSuffix: $partnerA_suffix
      APostmarriageSurname: $partnerA_surName
      ADOB: $partnerA_dob
      ACurrentAge: $partnerA_age
      AOccupation: $partnerA_occupation
      AFatherName: $partnerA_parentB_Name
      AMotherName: $partnerA_parentA_Name
      AFatherSurname: $partnerA_parentA_Surname
      AMotherSurname: $partnerA_parentB_Surname
      AStreetAddress: $partnerA_residenceAddress
      ACity: $partnerA_residenceCity
      AState: $partnerA_residenceState
      AZIPCode: $partnerA_residenceZip
      AResidenceCountry: $partnerA_residenceCountry
      AMarriageNumber: $partnerA_marriageNumb
      AStatofLastMarriage: $partnerA_lastMarriageStatus
      APartnershipStatus: $partnerA_partnershipType
      ADissolutionStatus: $partnerA_partnershipTypeDissolved
      APartnershipState: $partnerA_partnershipState
      AParentsMarried: $partnerA_parentsMarriedAtBirth
      ABloodRelative: $partnerA_bloodRelation
      ABloodDescr: $partnerA_bloodRelationDesc
      ABirthplace: $partnerA_birthCity
      ABirthState: $partnerA_birthState
      ABirthCountry: $partnerA_birthCountry
      ASexNum: $partnerA_sex
      ASex: $partnerA_sex
      ABirthHospital: $partnerA_birthHospital
      BApplicantFName: $partnerB_firstName
      BApplicantLName: $partnerB_lastName
      BApplicantMiddleName: $partnerB_middleName
      BApplicantSuffix: $partnerB_suffix
      BPostmarriageSurname: $partnerB_surName
      BDOB: $partnerB_dob
      BCurrentAge: $partnerB_age
      BOccupation: $partnerB_occupation
      BFatherName: $partnerB_parentB_Name
      BMotherName: $partnerB_parentA_Name
      BFatherSurname: $partnerB_parentA_Surname
      BMotherSurname: $partnerB_parentB_Surname
      BStreetAddress: $partnerB_residenceAddress
      BCity: $partnerB_residenceCity
      BState: $partnerB_residenceState
      BZIPCode: $partnerB_residenceZip
      BResidenceCountry: $partnerB_residenceCountry
      BMarriageNumber: $partnerB_marriageNumb
      BStatofLastMarriage: $partnerB_lastMarriageStatus
      BPartnershipStatus: $partnerB_partnershipType
      BDissolutionStatus: $partnerB_partnershipTypeDissolved
      BPartnershipState: $partnerB_partnershipState
      BParentsMarried: $partnerB_parentsMarriedAtBirth
      BBloodRelative: $partnerB_bloodRelation
      BBloodDescr: $partnerB_bloodRelationDesc
      BBirthplace: $partnerB_birthCity
      BBirthState: $partnerB_birthState
      BBirthCountry: $partnerB_birthCountry
      BSexNum: $partnerB_sex
      BSex: $partnerB_sex
      BBirthHospital: $partnerB_birthHospital
    ) {
      order {
        id
      }
      error {
        message
        cause
      }
    }
  }
`;

export default async function submitMarriageIntentionCertificateOrder(
  fetchGraphql: FetchGraphql,
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest
): Promise<MarriageIntentionCertificateOrderResult> {
  const {
    requestInformation: {
      email,
      dayPhone,
      appointmentDate,
      partnerA_firstName,
      partnerA_lastName,
      partnerA_middleName,
      partnerA_suffix,
      partnerA_surName,
      partnerA_dob,
      partnerA_age,
      partnerA_occupation,
      partnerA_sex,
      partnerA_bloodRelation,
      partnerA_bloodRelationDesc,
      partnerA_parentsMarriedAtBirth,
      partnerA_parentA_Name,
      partnerA_parentA_Surname,
      partnerA_parentB_Name,
      partnerA_parentB_Surname,
      partnerA_birthHospital,
      partnerA_birthCity,
      partnerA_birthState,
      partnerA_birthCountry,
      partnerA_partnershipType,
      partnerA_partnershipTypeDissolved,
      partnerA_partnershipState,
      partnerA_residenceAddress,
      partnerA_residenceStreetNum,
      partnerA_residenceStreetName,
      partnerA_residenceSAptNum,
      partnerA_residenceCountry,
      partnerA_residenceCity,
      partnerA_residenceState,
      partnerA_residenceZip,
      partnerA_marriageNumb,
      partnerA_lastMarriageStatus,
      partnerB_firstName,
      partnerB_lastName,
      partnerB_middleName,
      partnerB_suffix,
      partnerB_surName,
      partnerB_dob,
      partnerB_age,
      partnerB_occupation,
      partnerB_sex,
      partnerB_bloodRelation,
      partnerB_bloodRelationDesc,
      partnerB_parentsMarriedAtBirth,
      partnerB_parentA_Name,
      partnerB_parentA_Surname,
      partnerB_parentB_Name,
      partnerB_parentB_Surname,
      partnerB_birthHospital,
      partnerB_birthCity,
      partnerB_birthState,
      partnerB_birthCountry,
      partnerB_partnershipType,
      partnerB_partnershipTypeDissolved,
      partnerB_partnershipState,
      partnerB_residenceAddress,
      partnerB_residenceStreetNum,
      partnerB_residenceStreetName,
      partnerB_residenceSAptNum,
      partnerB_residenceCountry,
      partnerB_residenceCity,
      partnerB_residenceState,
      partnerB_residenceZip,
      partnerB_marriageNumb,
      partnerB_lastMarriageStatus,
    },
  } = marriageIntentionCertificateRequest;

  const queryVariables = {
    email,
    dayPhone,
    appointmentDate,
    partnerA_firstName,
    partnerA_lastName,
    partnerA_middleName,
    partnerA_suffix,
    partnerA_surName,
    partnerA_dob,
    partnerA_age,
    partnerA_occupation,
    partnerA_sex,
    partnerA_bloodRelation,
    partnerA_bloodRelationDesc,
    partnerA_parentsMarriedAtBirth,
    partnerA_parentA_Name,
    partnerA_parentA_Surname,
    partnerA_parentB_Name,
    partnerA_parentB_Surname,
    partnerA_birthHospital,
    partnerA_birthCity,
    partnerA_birthState,
    partnerA_birthCountry,
    partnerA_partnershipType,
    partnerA_partnershipTypeDissolved,
    partnerA_partnershipState,
    partnerA_residenceAddress,
    partnerA_residenceStreetNum,
    partnerA_residenceStreetName,
    partnerA_residenceSAptNum,
    partnerA_residenceCountry,
    partnerA_residenceCity,
    partnerA_residenceState,
    partnerA_residenceZip,
    partnerA_marriageNumb,
    partnerA_lastMarriageStatus,

    partnerB_firstName,
    partnerB_lastName,
    partnerB_middleName,
    partnerB_suffix,
    partnerB_surName,
    partnerB_dob,
    partnerB_age,
    partnerB_occupation,
    partnerB_sex,
    partnerB_bloodRelation,
    partnerB_bloodRelationDesc,
    partnerB_parentsMarriedAtBirth,
    partnerB_parentA_Name,
    partnerB_parentA_Surname,
    partnerB_parentB_Name,
    partnerB_parentB_Surname,
    partnerB_birthHospital,
    partnerB_birthCity,
    partnerB_birthState,
    partnerB_birthCountry,
    partnerB_partnershipType,
    partnerB_partnershipTypeDissolved,
    partnerB_partnershipState,
    partnerB_residenceAddress,
    partnerB_residenceStreetNum,
    partnerB_residenceStreetName,
    partnerB_residenceSAptNum,
    partnerB_residenceCountry,
    partnerB_residenceCity,
    partnerB_residenceState,
    partnerB_residenceZip,
    partnerB_marriageNumb,
    partnerB_lastMarriageStatus,
  };

  // eslint-disable-next-line no-console
  // console.log(
  //   'cert order > handleOrder > queryVariables: ',
  //   queryVariables,
  //   QUERY
  // );
  const response = await fetchGraphql(QUERY, queryVariables);

  return response.submitMarriageIntentionCertificateOrder;
}
