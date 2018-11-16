import RequestForm from '../store/RequestForm';

import submitCase from './submit-request';
import { Service } from '../types';
import {
  SubmitCaseVariables,
  MetadataRequirement,
  ServiceAttributeDatatype,
  ServiceAttributeConditionalClause,
  ServiceAttributeConditionalOp,
  ServiceAttributeConditionValueType,
} from './types';

const COSMIC_SERVICE: Service = {
  name: 'Cosmic Incursion',
  description: 'Bad things getting in from other universes',
  code: 'CSMCINC',
  contactRequirement: MetadataRequirement.REQUIRED,
  locationRequirement: MetadataRequirement.VISIBLE,
  attributes: [
    {
      required: false,
      type: ServiceAttributeDatatype.TEXT,
      code: 'ST-CMTS',
      description: 'Please provide any other relevant information:',
      values: null,
      validations: [],
      conditionalValues: null,
      dependencies: null,
    },
    {
      required: false,
      type: ServiceAttributeDatatype.INFORMATIONAL,
      code: 'INFO-NEDRMV1',
      description:
        '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
      values: null,
      validations: [],
      conditionalValues: null,
      dependencies: null,
    },
    {
      required: true,
      type: ServiceAttributeDatatype.SINGLEVALUELIST,
      code: 'SR-AVENG',
      description: 'Which Avengers team do you need?',
      values: [
        { key: 'mcu', name: 'Cinematic' },
        { key: 'great-lakes', name: 'Great Lakes' },
        { key: 'us-avengers', name: 'US Avengers' },
      ],
      validations: [],
      conditionalValues: [],
      dependencies: null,
    },
    {
      required: false,
      type: ServiceAttributeDatatype.MULTIVALUELIST,
      code: 'MR-WHO',
      description: 'Who would you like?',
      values: [{ key: 'anyone', name: 'Anyone' }],
      validations: [],
      conditionalValues: [
        {
          dependentOn: {
            clause: ServiceAttributeConditionalClause.AND,
            conditions: [
              {
                attribute: 'SR-AVENG',
                op: ServiceAttributeConditionalOp.eq,
                value: {
                  type: ServiceAttributeConditionValueType.STRING,
                  string: 'mcu',
                  array: null,
                  number: null,
                },
              },
            ],
          },
          values: [
            { key: 'iron-man', name: 'Iron Man' },
            { key: 'thor', name: 'Thor' },
            { key: 'hulk', name: 'Hulk' },
            { key: 'black-widow', name: 'Black Widow' },
            { key: 'captain-america', name: 'Captain America' },
            { key: 'hawkeye', name: 'Hawkeye' },
          ],
        },
        {
          dependentOn: {
            clause: ServiceAttributeConditionalClause.AND,
            conditions: [
              {
                attribute: 'SR-AVENG',
                op: ServiceAttributeConditionalOp.eq,
                value: {
                  type: ServiceAttributeConditionValueType.STRING,
                  string: 'great-lakes',
                  array: null,
                  number: null,
                },
              },
            ],
          },
          values: [
            { key: 'flatman', name: 'Flatman' },
            { key: 'big-bertha', name: 'Big Bertha' },
            { key: 'doorman', name: 'Doorman' },
            { key: 'mr-invincible', name: 'Mr. Invincible' },
            { key: 'good-boy', name: 'Good Boy' },
          ],
        },
        {
          dependentOn: {
            clause: ServiceAttributeConditionalClause.AND,
            conditions: [
              {
                attribute: 'SR-AVENG',
                op: ServiceAttributeConditionalOp.eq,
                value: {
                  type: ServiceAttributeConditionValueType.STRING,
                  string: 'us-avengers',
                  array: null,
                  number: null,
                },
              },
            ],
          },
          values: [
            { key: 'citizen-v', name: 'Citizen V' },
            { key: 'red-hulk', name: 'Red Hulk' },
            { key: 'squirrel-girl', name: 'Squirrel Girl' },
            { key: 'cannonball', name: 'Cannonball' },
            { key: 'iron-patriot', name: 'Iron Patriot' },
            { key: 'enigma', name: 'Enigma' },
          ],
        },
      ],
      dependencies: null,
    },
    {
      required: true,
      type: ServiceAttributeDatatype.STRING,
      code: 'SR-CAP',
      description: 'Which Captain America are you looking for?',
      validations: [],
      dependencies: {
        clause: ServiceAttributeConditionalClause.AND,
        conditions: [
          {
            attribute: 'MR-WHO',
            op: ServiceAttributeConditionalOp.in,
            value: {
              type: ServiceAttributeConditionValueType.STRING,
              string: 'captain-america',
              array: null,
              number: null,
            },
          },
        ],
      },
      values: null,
      conditionalValues: null,
    },
  ],
};

test('SubmitCase', async () => {
  const requestForm = new RequestForm(COSMIC_SERVICE);
  requestForm.description = 'Things are bad';
  requestForm.firstName = 'Carol';
  requestForm.lastName = 'Danvers';
  requestForm.email = 'marvel@alphaflight.gov';

  requestForm.questions[0].value = 'Thanos is here';
  requestForm.questions[2].value = 'us-avengers';
  // This should get filtered to Squrrel Girl and Enigma
  requestForm.questions[3].value = ['thor', 'squirrel-girl', 'enigma'];
  // This should not appear at all because Captain America is not picked
  requestForm.questions[4].value = 'Danielle Cage';

  requestForm.mediaUrl = 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg';

  const fetchGraphql = jest.fn().mockReturnValue({});

  await submitCase(fetchGraphql, {
    service: COSMIC_SERVICE,
    description: requestForm.description,
    descriptionForClassifier: 'cosmic problem',
    firstName: requestForm.firstName,
    lastName: requestForm.lastName,
    email: requestForm.email,
    phone: requestForm.phone,
    location: requestForm.location,
    address: requestForm.address,
    addressId: requestForm.addressId,
    questions: requestForm.questions,
    mediaUrl: requestForm.mediaUrl,
  });

  const mutationVariables: SubmitCaseVariables = {
    code: 'CSMCINC',
    description: 'Things are bad',
    descriptionForClassifier: 'cosmic problem',
    firstName: 'Carol',
    lastName: 'Danvers',
    email: 'marvel@alphaflight.gov',
    phone: '',
    address: '',
    addressId: null,
    location: null,
    mediaUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
    attributes: [
      { code: 'ST-CMTS', value: 'Thanos is here' },
      { code: 'SR-AVENG', value: 'us-avengers' },
      { code: 'MR-WHO', value: 'squirrel-girl' },
      { code: 'MR-WHO', value: 'enigma' },
    ],
  };

  expect(fetchGraphql).toHaveBeenCalledWith(
    expect.stringContaining('SubmitCase'),
    mutationVariables
  );
});
