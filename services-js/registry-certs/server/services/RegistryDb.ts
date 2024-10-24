import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import DataLoader from 'dataloader';
import Rollbar from 'rollbar';
import { ConnectionPool, IProcedureResult } from 'mssql';
import mime from 'mime-types';
import mssql from 'mssql';

import {
  DatabaseConnectionOptions,
  createConnectionPool,
} from '@cityofboston/mssql-common';

import RegistryDbFake from './RegistryDbFake';
import { AnnotatedFilePart, PACKAGE_SRC_ROOT } from '../util';

import { COUNTRIES } from './DBInputData';

const readFile = promisify(fs.readFile);

export enum OrderType {
  DeathCertificate = 'DC',
  BirthCertificate = 'BC',
  MarriageCertificate = 'MC',
  MarriageIntentionCertificate = 'MIC',
}

type RestrictedOrderType = 'BC' | 'MC' | 'MIC';

export interface DeathCertificate {
  CertificateID: number;
  'Registered Number': string;
  InOut: 'I' | '*' | '#' | undefined | string;
  'Date of Death': string | null;
  'Decedent Name': string;
  'Last Name': string;
  'First Name': string;
  RegisteredYear: string;
  AgeOrDateOfBirth: string;
  Pending: number;
}

export interface DeathCertificateSearchResult extends DeathCertificate {
  ResultCount: number;
}

export interface BirthCertificate {
  CertificatesID: number;
  'Registered Number': string;
  InOut: boolean;
  'Date of Birth': string;
  'Certificate Name': string;
  'Last Name': string;
  'First Name': string;
  RegisteredYear: string;
  Impounded: boolean;
}

export interface AddOrderOptions {
  orderID: string;
  orderDate: Date;
  contactName: string;
  contactEmail: string;
  confirmContactEmail: string;
  contactPhone: string;
  shippingName: string;
  shippingCompany: string;
  shippingAddr1: string;
  shippingAddr2: string;
  shippingCity: string;
  shippingState: string;
  shippingZIP: string;
  billingName: string;
  billingAddr1: string;
  billingAddr2: string;
  billingCity: string;
  billingState: string;
  billingZIP: string;
  billingLast4: string;
  serviceFee: number;
  idempotencyKey: string;
}

export interface AddOrderResult {
  OrderKey: number;
  ErrorMessage: string;
}

export interface FindOrderResult {
  OrderKey: number;
  OrderType: string;
  OrderDate: Date;
  OrderStatus: string;
  ProcessDtTm: string | null;
  ContactName: string;
  ContactEmail: string;
  ContactPhone: string;
  ShippingName: string;
  ShippingCompany: string;
  ShippingAddr1: string;
  ShippingAddr2: string;
  ShippingCity: string;
  ShippingState: string;
  ShippingZIP: string;
  BillingName: string;
  BillingAddr1: string;
  BillingAddr2: string;
  BillingCity: string;
  BillingState: string;
  BillingZIP: string;
  CertificateIDs: string;
  CertificateQuantities: string;
  CertificateCost: number;
  ServiceFee: number;
  TotalCost: number;
}

export interface FindBirthCertificateRequestResult {
  CertificateFirstName: string;
  CertificateLastName: string;
  DateOfBirth: Date;
  Quantity: number;
  TotalCost: number;
}

export interface FindMarriageCertificateRequestResult {
  CertificateFullName1: string;
  CertificateFullName2: string;
  CertificateMaidenName1: string;
  CertificateMaidenName2: string;
  CertificateAltSpellings1: string;
  CertificateAltSpellings2: string;
  DateOfMarriageExact: Date;
  DateOfMarriageUnsure: string;
  Quantity: number;
  TotalCost: number;
}

export interface MarriageIntentionCertificateRequestArgs {
  Email: string;
  DayPhone: string;
  AppointmentDate: string;

  AApplicantFName: string;
  AApplicantLName: string;
  AApplicantMiddleName: string;
  AApplicantSuffix: string;
  APostmarriageSurname: string;
  ADOB: string;
  ACurrentAge: string;
  AOccupation: string;
  AFatherName: string;
  AMotherName: string;
  AFatherSurname: string;
  AMotherSurname: string;
  AStreetAddress: string;
  ACity: string;
  AState: string;
  AZIPCode: string;
  AResidenceCountry: string;
  AMarriageNumber: string;
  AStatofLastMarriage: string;
  APartnershipStatus: string;
  ADissolutionStatus: string;
  APartnershipState: string;
  AParentsMarried: string;
  ABloodRelative: string;
  ABloodDescr: string;
  ABirthplace: string;
  ABirthState: string;
  ABirthCountry: string;
  ASexNum: string;
  ASex: string;
  ABirthHospital: string;

  BApplicantFName: string;
  BApplicantLName: string;
  BApplicantMiddleName: string;
  BApplicantSuffix: string;
  BPostmarriageSurname: string;
  BDOB: string;
  BCurrentAge: string;
  BOccupation: string;
  BFatherName: string;
  BMotherName: string;
  BFatherSurname: string;
  BMotherSurname: string;
  BStreetAddress: string;
  BCity: string;
  BState: string;
  BZIPCode: string;
  BResidenceCountry: string;
  BMarriageNumber: string;
  BStatofLastMarriage: string;
  BPartnershipStatus: string;
  BDissolutionStatus: string;
  BPartnershipState: string;
  BParentsMarried: string;
  BBloodRelative: string;
  BBloodDescr: string;
  BBirthplace: string;
  BBirthState: string;
  BBirthCountry: string;
  BSexNum: string;
  BSex: string;
  BBirthHospital: string;
}

export interface BirthCertificateRequestArgs {
  certificateLastName: string;
  certificateFirstName: string;
  alternativeSpellings: string;
  dateOfBirth: Date;
  parent1LastName: string;
  parent1FirstName: string;
  parent2LastName: string;
  parent2FirstName: string;
  requestDetails: string;
}

export interface MarriageCertificateRequestArgs {
  certificateFullName1: string;
  certificateFullName2: string;
  certificateMaidenName1: string;
  certificateMaidenName2: string;
  certificateAltSpellings1: string;
  certificateAltSpellings2: string;
  dateOfMarriageExact: string;
  dateOfMarriageUnsure: string;
  requestDetails: string;
  // customerNotes: string;
}

const MAX_ID_LOOKUP_LENGTH = 1000;

// Converts a list of key strings into an array of comma-separated strings,
// each no longer than maxLength.
//
// E.g.: ["12345", "67890", "abcde"] => ["12345,67890", "abcde"]
export function splitKeys(
  maxLength: number,
  keys: Array<string>
): Array<string> {
  const keyStrings: Array<string> = [];
  let currentKeyString = '';

  keys.forEach(key => {
    if (currentKeyString.length === 0) {
      currentKeyString = key;
    } else if (currentKeyString.length + key.length + 1 < maxLength) {
      currentKeyString = `${currentKeyString},${key}`;
    } else {
      keyStrings.push(currentKeyString);
      currentKeyString = key;
    }
  });

  if (currentKeyString.length > 0) {
    keyStrings.push(currentKeyString);
  }

  return keyStrings;
}

export function convertJsDateToSql(dateVal: any): any {
  const timezoneOffset = new Date().getTimezoneOffset() * 60000;
  const aptDate: any = new Date(dateVal);
  const formattedAptDate: any = new Date(aptDate - timezoneOffset)
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '');

  return formattedAptDate;
}

export default class RegistryDb {
  private pool: ConnectionPool;
  private lookupDeathCertificateLoader: DataLoader<
    string,
    DeathCertificate | null
  >;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
    this.lookupDeathCertificateLoader = new DataLoader(keys =>
      this.lookupDeathCertificateLoaderFetch(keys)
    );
  }

  async searchDeathCertificates(
    name: string,
    page: number,
    pageSize: number,
    startYear: string | null | undefined,
    endYear: string | null | undefined
  ): Promise<Array<DeathCertificateSearchResult>> {
    const resp: IProcedureResult<
      DeathCertificateSearchResult
    > = (await this.pool
      .request()
      .input('searchFor', name)
      .input('pageNumber', page)
      .input('pageSize', pageSize)
      .input('sortBy', 'dateOfDeath')
      .input('startYear', startYear)
      .input('endYear', endYear)
      .execute('Registry.Death.sp_FindCertificatesWeb')) as any;

    const { recordset } = resp;

    if (!recordset) {
      throw new Error('Recordset for search came back empty');
    }

    return recordset;
  }

  async lookupDeathCertificate(id: string): Promise<DeathCertificate | null> {
    return this.lookupDeathCertificateLoader.load(id);
  }

  // "any" here is really DeathCertificate | null | Error
  private async lookupDeathCertificateLoaderFetch(
    keys: Array<string>
  ): Promise<Array<any>> {
    // The api can only take 1000 characters of keys at once. We probably won't
    // run into that issue but just in case we split up and parallelize.
    const keyStrings = splitKeys(MAX_ID_LOOKUP_LENGTH, keys);

    const idToOutputMap: {
      [key: string]: DeathCertificate | null | Error | unknown;
    } = {};

    const allResults: Array<Array<DeathCertificate>> = await Promise.all(
      keyStrings.map(async keyString => {
        try {
          const resp: IProcedureResult<DeathCertificate> = (await this.pool
            .request()
            .input('idList', keyString)
            .execute('Registry.Death.sp_GetCertificatesWeb')) as any;

          return resp.recordset;
        } catch (err) {
          keyString.split(',').forEach(id => (idToOutputMap[id] = err));
          return [];
        }
      })
    );

    allResults.forEach(results => {
      results.forEach((cert: DeathCertificate) => {
        idToOutputMap[cert.CertificateID.toString()] = cert;
      });
    });

    return keys.map(k => idToOutputMap[k]);
  }

  async addOrder(
    orderType: OrderType,
    {
      orderID,
      orderDate,
      contactName,
      contactEmail,
      confirmContactEmail,
      contactPhone,
      shippingName,
      shippingCompany,
      shippingAddr1,
      shippingAddr2,
      shippingCity,
      shippingState,
      shippingZIP,
      billingName,
      billingAddr1,
      billingAddr2,
      billingCity,
      billingState,
      billingZIP,
      billingLast4,
      serviceFee,
      idempotencyKey,
    }: AddOrderOptions
  ): Promise<number> {
    const resp: IProcedureResult<AddOrderResult> = await this.pool
      .request()
      .input('orderID', orderID)
      .input('orderType', orderType)
      .input('orderDate', orderDate)
      .input('contactName', contactName)
      .input('contactEmail', contactEmail)
      .input('contactPhone', contactPhone)
      .input('shippingName', shippingName)
      .input('shippingCompany', shippingCompany)
      .input('shippingAddr1', shippingAddr1)
      .input('shippingAddr2', shippingAddr2)
      .input('shippingCity', shippingCity)
      .input('shippingState', shippingState)
      .input('shippingZIP', shippingZIP)
      .input('billingName', billingName)
      .input('billingAddr1', billingAddr1)
      .input('billingAddr2', billingAddr2)
      .input('billingCity', billingCity)
      .input('billingState', billingState)
      .input('billingZIP', billingZIP)
      .input('billingLast4', billingLast4)
      .input('serviceFee', `$${serviceFee.toFixed(2)}`)
      .input('idempotencyKey', idempotencyKey)
      .execute('Commerce.sp_AddOrder');

    const { recordset } = resp;
    console.log(
      `Fields not Saved(DB): confirmContactEmail: confirmContactEmail: ${confirmContactEmail}`
    );

    if (!recordset || recordset.length === 0) {
      throw new Error('Recordset for creating an order came back empty');
    }

    const result = recordset[0];

    if (result.ErrorMessage) {
      throw new Error(result.ErrorMessage);
    }

    return result.OrderKey;
  }

  async addDeathCertificateItem(
    orderKey: number,
    certificateId: number,
    certificateName: string,
    quantity: number,
    certificateCost: number
  ): Promise<void> {
    const resp: IProcedureResult<Object> = await this.pool
      .request()
      .input('orderKey', orderKey)
      .input('orderType', OrderType.DeathCertificate)
      .input('certificateID', certificateId)
      .input('certificateName', certificateName)
      .input('quantity', quantity)
      .input('unitCost', `$${certificateCost.toFixed(2)}`)
      .execute('Commerce.sp_AddOrderItem');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      throw new Error(
        `Could not add item to order ${orderKey}. Likely no certificate ID ${certificateId} in the database.`
      );
    }
  }

  async addMarriageIntentionCertificateRequest({
    Email,
    DayPhone,
    AppointmentDate,
    AApplicantFName,
    AApplicantLName,
    AApplicantMiddleName,
    AApplicantSuffix,
    APostmarriageSurname,
    ADOB,
    ACurrentAge,
    AOccupation,
    AFatherName,
    AMotherName,
    AFatherSurname,
    AMotherSurname,
    AStreetAddress,
    ACity,
    AState,
    AZIPCode,
    AResidenceCountry,
    AMarriageNumber,
    AStatofLastMarriage,
    APartnershipStatus,
    ADissolutionStatus,
    APartnershipState,
    AParentsMarried,
    ABloodRelative,
    ABloodDescr,
    ABirthplace,
    ABirthState,
    ABirthCountry,
    ASexNum,
    ASex,
    BApplicantFName,
    BApplicantLName,
    BApplicantMiddleName,
    BApplicantSuffix,
    BPostmarriageSurname,
    BDOB,
    BCurrentAge,
    BOccupation,
    BFatherName,
    BMotherName,
    BFatherSurname,
    BMotherSurname,
    BStreetAddress,
    BCity,
    BState,
    BZIPCode,
    BResidenceCountry,
    BMarriageNumber,
    BStatofLastMarriage,
    BPartnershipStatus,
    BDissolutionStatus,
    BPartnershipState,
    BParentsMarried,
    BBloodRelative,
    BBloodDescr,
    BBirthplace,
    BBirthState,
    BBirthCountry,
    BSexNum,
    BSex,
  }: MarriageIntentionCertificateRequestArgs): Promise<number> {
    const formattedAptDate = convertJsDateToSql(AppointmentDate);
    const formattedADOB = convertJsDateToSql(ADOB);
    const formattedBDOB = convertJsDateToSql(BDOB);

    const AFName =
      AApplicantMiddleName && AApplicantMiddleName.length > 0
        ? `${AApplicantFName.toLocaleUpperCase()} ${AApplicantMiddleName.toLocaleUpperCase()}`
        : AApplicantFName.toLocaleUpperCase();
    const BFName =
      BApplicantMiddleName && BApplicantMiddleName.length > 0
        ? `${BApplicantFName.toLocaleUpperCase()} ${BApplicantMiddleName.toLocaleUpperCase()}`
        : BApplicantFName.toLocaleUpperCase();
    const ALName =
      AApplicantSuffix &&
      AApplicantSuffix.length > 0 &&
      AApplicantSuffix !== 'N/A'
        ? `${AApplicantLName.toLocaleUpperCase()} ${AApplicantSuffix.toLocaleUpperCase()}`
        : AApplicantLName.toLocaleUpperCase();
    const BLName =
      BApplicantSuffix &&
      BApplicantSuffix.length > 0 &&
      BApplicantSuffix !== 'N/A'
        ? `${BApplicantLName.toLocaleUpperCase()} ${BApplicantSuffix.toLocaleUpperCase()}`
        : BApplicantLName.toLocaleUpperCase();
    const A_ZipCode =
      AResidenceCountry && AResidenceCountry !== 'USA'
        ? AResidenceCountry.toLocaleUpperCase()
        : AZIPCode;
    const B_ZipCode =
      BResidenceCountry && BResidenceCountry !== 'USA'
        ? AResidenceCountry.toLocaleUpperCase()
        : BZIPCode;
    const getCountryFullName = (Name: string) => {
      const countryObj = COUNTRIES.find(entry => entry.value === Name);
      let retVal = '';

      if (countryObj && countryObj.label) {
        retVal = ` ${countryObj.label.toLocaleUpperCase()}`;
        if (countryObj.shortLabel)
          retVal = ` ${countryObj.shortLabel.toLocaleUpperCase()}`;
      }

      return retVal;
    };
    const getStateFullName = (Name: string) => {
      return Name !== '--' ? ` ${Name.toLocaleUpperCase()}` : '';
    };
    const A_Birthplace =
      ABirthCountry && ABirthCountry !== 'USA'
        ? `${ABirthplace.toLocaleUpperCase()}${getCountryFullName(
            ABirthCountry
          )}`
        : `${ABirthplace.toLocaleUpperCase()}${getStateFullName(ABirthState)}`;
    const B_Birthplace =
      BBirthCountry && BBirthCountry !== 'USA'
        ? `${BBirthplace.toLocaleUpperCase()}${getCountryFullName(
            BBirthCountry
          )}`
        : `${BBirthplace.toLocaleUpperCase()}${getStateFullName(BBirthState)}`;
    const A_partnershipStatus =
      APartnershipStatus === 'N/A' ? null : APartnershipStatus;
    const BB_partnershipStatus =
      BPartnershipStatus === 'N/A' ? null : BPartnershipStatus;
    const A_PartnershipState =
      APartnershipStatus === 'N/A' ? '' : APartnershipState;
    const B_PartnershipState =
      BPartnershipStatus === 'N/A' ? '' : BPartnershipState;
    const A_DissolutionStatus =
      APartnershipStatus === 'N/A' || ADissolutionStatus === 'N/A'
        ? null
        : ADissolutionStatus;
    const B_DissolutionStatus =
      BPartnershipStatus === 'N/A' || BDissolutionStatus === 'N/A'
        ? null
        : BDissolutionStatus;
    const A_BirthState = ABirthCountry !== 'USA' ? ABirthCountry : ABirthState;
    const B_BirthState = BBirthCountry !== 'USA' ? BBirthCountry : BBirthState;

    const formattedParentName = (name: string, surname: string) => {
      return surname && surname.length > 2
        ? `${name.toLocaleUpperCase()}/${surname.toLocaleUpperCase()}`
        : `${name.toLocaleUpperCase()}`;
    };
    const A_MotherName = formattedParentName(AMotherName, AMotherSurname);
    const B_MotherName = formattedParentName(BMotherName, BMotherSurname);
    const A_FatherName = formattedParentName(AFatherName, AFatherSurname);
    const B_FatherName = formattedParentName(BFatherName, BFatherSurname);
    const A_StatofLastMarriage =
      AStatofLastMarriage === 'N/A' ? '' : AStatofLastMarriage;
    const B_StatofLastMarriage =
      BStatofLastMarriage === 'N/A' ? '' : BStatofLastMarriage;

    const APostMarriageSurname =
      APostmarriageSurname.length > 0
        ? APostmarriageSurname.toLocaleUpperCase()
        : `${AFName} ${ALName}`;

    const BPostMarriageSurname =
      BPostmarriageSurname.length > 0
        ? BPostmarriageSurname.toLocaleUpperCase()
        : `${BFName} ${BLName}`;

    const parentNameVal = fieldValue => {
      let retVal = '---';
      if (fieldValue.length > 0) {
        retVal = fieldValue;
      }
      return retVal;
    };

    const getDefaultMarriageNumb = field => {
      let retVal = field;

      if (field.length < 1 || field === '') {
        retVal = '1st';
      }

      return retVal;
    };

    const resp: IProcedureResult<{
      RequestItemKey: number;
      ErrorMessage: string;
    }> = await this.pool
      .request()
      .input('Email', Email)
      .input('DayPhone', DayPhone)
      .input('AppointmentDate', formattedAptDate)
      .input('AApplicantFName', AFName)
      .input('AApplicantLName', ALName)
      .input('APostmarriageSurname', APostMarriageSurname)
      .input('ADOB', formattedADOB)
      .input('ACurrentAge', parseInt(ACurrentAge))
      .input('AOccupation', AOccupation.toLocaleUpperCase().trim())
      .input('AStreetAddress', AStreetAddress.toLocaleUpperCase().trim())
      .input('ACity', ACity.toLocaleUpperCase().trim())
      .input('AState', AState.trim())
      .input('AZIPCode', A_ZipCode)
      .input('AMarriageNumber', getDefaultMarriageNumb(AMarriageNumber))
      .input('AStatofLastMarriage', A_StatofLastMarriage)
      .input('AMotherName', parentNameVal(A_MotherName))
      .input('AMotherSurname', null)
      .input('AFatherName', parentNameVal(A_FatherName))
      .input('AFatherSurname', null)
      .input('APartnershipStatus', A_partnershipStatus)
      .input('ADissolutionStatus', A_DissolutionStatus)
      .input('APartnershipState', A_PartnershipState)
      .input('AParentsMarried', parseInt(AParentsMarried))
      .input('ABloodRelative', parseInt(ABloodRelative))
      .input('ABloodDescr', ABloodDescr.toLocaleUpperCase())
      .input('ABirthplace', A_Birthplace)
      .input('ABirthState', A_BirthState)
      .input('ASexNum', ASexNum.split('|')[0] + 1 || 0)
      .input('ASex', ASex.split('|')[1] || '')

      .input('BApplicantFName', BFName)
      .input('BApplicantLName', BLName)
      .input('BPostmarriageSurname', BPostMarriageSurname)
      .input('BDOB', formattedBDOB)
      .input('BCurrentAge', parseInt(BCurrentAge))
      .input('BOccupation', BOccupation.toLocaleUpperCase().trim())
      .input('BStreetAddress', BStreetAddress.toLocaleUpperCase().trim())
      .input('BCity', BCity.toLocaleUpperCase().trim())
      .input('BState', BState.trim())
      .input('BZIPCode', B_ZipCode)
      .input('BMarriageNumber', getDefaultMarriageNumb(BMarriageNumber))
      .input('BStatofLastMarriage', B_StatofLastMarriage)
      .input('BMotherName', parentNameVal(B_MotherName))
      .input('BMotherSurname', null)
      .input('BFatherName', parentNameVal(B_FatherName))
      .input('BFatherSurname', null)
      .input('BPartnershipStatus', BB_partnershipStatus)
      .input('BDissolutionStatus', B_DissolutionStatus)
      .input('BPartnershipState', B_PartnershipState)
      .input('BParentsMarried', parseInt(BParentsMarried))
      .input('BBloodRelative', parseInt(BBloodRelative))
      .input('BBloodDescr', BBloodDescr.toLocaleUpperCase())
      .input('BBirthplace', B_Birthplace)
      .input('BBirthState', B_BirthState)
      .input('BSexNum', BSexNum.split('|')[0] + 1 || 0)
      .input('BSex', BSex.split('|')[1] || '')
      .execute('MarriageRegistry.dbo.sp_digital_insert_marriage_intention');

    const { recordset } = resp;
    // eslint-disable-next-line no-console
    console.log('RegistryDb>execute>resp: ', resp);

    if (!recordset || recordset.length === 0) {
      // eslint-disable-next-line no-console
      // console.log('RegistryDb>execute>recordset: ', recordset);
      // throw new Error(`Could not add marriage intention request to.`);
      return 12345;
    }

    if (recordset[0].ErrorMessage) {
      // eslint-disable-next-line no-console
      console.log(
        'RegistryDb>execute>recordset[0].ErrorMessage: ',
        recordset[0].ErrorMessage
      );
      throw new Error(recordset[0].ErrorMessage);
    }

    return recordset[0].RequestItemKey;
  }

  async addMarriageCertificateRequest(
    orderKey: number,
    {
      certificateFullName1,
      certificateFullName2,
      certificateMaidenName1,
      certificateMaidenName2,
      certificateAltSpellings1,
      certificateAltSpellings2,
      dateOfMarriageExact,
      dateOfMarriageUnsure,
      requestDetails,
    }: MarriageCertificateRequestArgs,
    quantity: number,
    certificateCost: number
  ): Promise<number> {
    const resp: IProcedureResult<{
      RequestItemKey: number;
      ErrorMessage: string;
    }> = await this.pool
      .request()
      .input('orderKey', orderKey)
      .input('orderType', OrderType.MarriageCertificate)
      .input('certificateFullName1', certificateFullName1)
      .input('certificateFullName2', certificateFullName2)
      .input('certificateMaidenName1', certificateMaidenName1)
      .input('certificateMaidenName2', certificateMaidenName2)
      .input('certificateAltSpellings1', certificateAltSpellings1)
      .input('certificateAltSpellings2', certificateAltSpellings2)
      .input(
        dateOfMarriageExact ? 'dateOfMarriageExact' : 'dateOfMarriageUnsure',
        dateOfMarriageExact
          ? new Date(dateOfMarriageExact)
          : dateOfMarriageUnsure
      )
      .input('requestDetails', requestDetails)
      .input('quantity', quantity)
      .input('unitCost', `$${certificateCost.toFixed(2)}`)
      .execute('Commerce.sp_AddMarriageRequest');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      throw new Error(`Could not add marriage request to ${orderKey}.`);
    }

    if (recordset[0].ErrorMessage) {
      throw new Error(recordset[0].ErrorMessage);
    }

    return recordset[0].RequestItemKey;
  }

  async addBirthCertificateRequest(
    orderKey: number,
    {
      certificateFirstName,
      certificateLastName,
      alternativeSpellings,
      dateOfBirth,
      parent1FirstName,
      parent1LastName,
      parent2FirstName,
      parent2LastName,
      requestDetails,
    }: BirthCertificateRequestArgs,
    quantity: number,
    certificateCost: number
  ): Promise<number> {
    const resp: IProcedureResult<{
      RequestItemKey: number;
      ErrorMessage: string;
    }> = await this.pool
      .request()
      .input('orderKey', orderKey)
      .input('orderType', OrderType.BirthCertificate)
      .input('certificateLastName', certificateLastName)
      .input('certificateFirstName', certificateFirstName)
      .input('alternativeSpellings', alternativeSpellings)
      .input('dateOfBirth', dateOfBirth)
      .input('parent1LastName', parent1LastName)
      .input('parent1FirstName', parent1FirstName)
      .input('parent2LastName', parent2LastName)
      .input('parent2FirstName', parent2FirstName)
      .input('requestDetails', requestDetails)
      .input('quantity', quantity)
      .input('unitCost', `$${certificateCost.toFixed(2)}`)
      .execute('Commerce.sp_AddBirthRequest');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      throw new Error(`Could not add birth request to ${orderKey}.`);
    }

    if (recordset[0].ErrorMessage) {
      throw new Error(recordset[0].ErrorMessage);
    }

    return recordset[0].RequestItemKey;
  }

  async addPayment(
    orderKey: number,
    paymentDate: Date,
    transactionId: string,
    totalInDollars: number
  ): Promise<void> {
    const resp: IProcedureResult<Object> = await this.pool
      .request()
      .input('orderKey', orderKey)
      .input('paymentDate', paymentDate)
      .input('paymentDescription', '')
      .input('transactionID', transactionId)
      .input('paymentAmount', `$${totalInDollars.toFixed(2)}`)
      .execute('Commerce.sp_AddPayment');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      throw new Error('Recordset for adding payment came back empty');
    }
  }

  async findOrder(orderId: string): Promise<FindOrderResult | null> {
    const resp: IProcedureResult<FindOrderResult> = await this.pool
      .request()
      .input('orderID', orderId)
      .execute('Commerce.sp_FindOrder');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      return null;
    }

    return recordset[0];
  }

  async lookupBirthCertificateOrderDetails(
    orderId: string
  ): Promise<FindBirthCertificateRequestResult | null> {
    const resp: IProcedureResult<
      FindBirthCertificateRequestResult
    > = await this.pool
      .request()
      .input('orderID', orderId)
      .execute('Commerce.sp_FindBirthCertificateRequest');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      return null;
    }

    return recordset[0];
  }

  async lookupMarriageCertificateOrderDetails(
    orderId: string
  ): Promise<FindMarriageCertificateRequestResult | null> {
    const resp: IProcedureResult<
      FindMarriageCertificateRequestResult
    > = await this.pool
      .request()
      .input('orderID', orderId)
      .execute('Commerce.sp_FindMarriageCertificateRequest');

    const { recordset } = resp;

    if (!recordset || recordset.length === 0) {
      return null;
    }

    return recordset[0];
  }

  async cancelOrder(orderKey: number, reason: string): Promise<void> {
    await this.pool
      .request()
      .input('orderKey', orderKey)
      .input('reason', reason)
      .execute('Commerce.sp_CancelOrder');
  }

  /**
   * Uploads a file if the user is required to submit ID images and/or
   * supporting documents with their Birth or Marriage certificate request.
   */
  async uploadFileAttachment(
    orderType: RestrictedOrderType,
    uploadSessionId: string,
    label: string | null,
    file: AnnotatedFilePart
  ): Promise<string> {
    const { filename, headers, payload } = file;
    const uploadStoreProcedure =
      orderType === 'BC'
        ? 'Commerce.sp_AddBirthRequestAttachment'
        : 'Commerce.sp_AddMarriageRequestAttachment';
    const contentType =
      headers['content-type'] ||
      mime.lookup(filename) ||
      'application/octet-stream';
    const out: any = await this.pool
      .request()
      .input('sessionUID', uploadSessionId)
      .input('contentType', contentType)
      .input('fileName', filename)
      .input('label', label)
      .input('attachmentData', mssql.VarBinary(mssql.MAX), payload)
      .execute(uploadStoreProcedure);
    const result = out.recordset[0];

    if (!result || out.returnValue !== 0) {
      throw new Error(
        `Did not get a successful result from SqlServer: ${out.returnValue}`
      );
    }

    if (result.ErrorMessage) {
      throw new Error(result.ErrorMessage);
    }

    return result.AttachmentKey.toString();
  }

  /**
   * Allow a user to remove an uploaded file for their Birth or Marriage
   * certificate request.
   *
   * Returns string on DB error, null on success.
   */
  async deleteFileAttachment(
    orderType: RestrictedOrderType,
    uploadSessionId: string,
    attachmentKey: string
  ): Promise<string | null> {
    const out: IProcedureResult<{ ErrorMessage: string }> = await this.pool
      .request()
      .input('sessionUID', uploadSessionId)
      .input('attachmentKey', parseInt(attachmentKey, 10))
      .execute(
        orderType === 'BC'
          ? 'Commerce.sp_DeleteBirthRequestAttachment'
          : 'Commerce.sp_DeleteMarriageRequestAttachment'
      );

    const result = out.recordset[0];

    if (!result || out.returnValue !== 0) {
      throw new Error(
        `Did not get a successful result from SqlServer: ${out.returnValue}`
      );
    }

    if (result.ErrorMessage) {
      return result.ErrorMessage;
    } else {
      return null;
    }
  }

  /**
   * Associate uploaded files with a particular Birth or Marriage
   * certificate request.
   */
  async addUploadsToOrder(
    orderType: RestrictedOrderType,
    requestItemKey: number,
    uploadSessionId: string
  ): Promise<void> {
    const out: IProcedureResult<any> = await this.pool
      .request()
      .input('requestItemKey', requestItemKey)
      .input('sessionUID', uploadSessionId)
      .execute(
        orderType === 'BC'
          ? 'Commerce.sp_AssociateBirthAttachments'
          : 'Commerce.sp_AssociateMarriageAttachments'
      );

    const result = out.recordset[0];
    // eslint-disable-next-line no-console
    // console.log(JSON.stringify(result, null, 2));

    if (!result || out.returnValue !== 0) {
      throw new Error(
        `Did not get a successful result from SqlServer: ${out.returnValue}`
      );
    }

    if (result.ErrorMessage) {
      throw new Error(result.ErrorMessage);
    }
  }
}

export class RegistryDbFactory {
  protected pool: ConnectionPool;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  registryDb() {
    return new RegistryDb(this.pool);
  }

  cleanup(): Promise<any> {
    return this.pool.close();
  }
}

export async function makeRegistryDbFactory(
  rollbar: Rollbar,
  connectionOptions: DatabaseConnectionOptions
): Promise<RegistryDbFactory> {
  const pool = await createConnectionPool(connectionOptions, err =>
    rollbar.error(err)
  );
  return new RegistryDbFactory(pool);
}

export async function makeFixtureRegistryDbFactory(
  fixtureName: string
): Promise<Required<RegistryDbFactory>> {
  const fixtureData = await readFile(
    path.resolve(PACKAGE_SRC_ROOT, fixtureName)
  );
  const json = JSON.parse(fixtureData.toString('utf-8'));

  return {
    registryDb() {
      return new RegistryDbFake(json) as any;
    },

    cleanup() {
      return Promise.resolve(null);
    },
  };
}
