import { Service } from '../types';

import RequestForm from './RequestForm';
import {
  MetadataRequirement,
  ServiceAttributeDatatype,
  ServiceAttributeConditionalClause,
  ServiceAttributeConditionalOp,
  ServiceAttributeConditionValueType,
} from '../queries/types';

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
      conditionalValues: null,
      dependencies: null,
      validations: [],
    },
    {
      required: false,
      type: ServiceAttributeDatatype.INFORMATIONAL,
      code: 'INFO-NEDRMV1',
      description:
        '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
      values: null,
      conditionalValues: null,
      dependencies: null,
      validations: [],
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
      conditionalValues: [],
      dependencies: null,
      validations: [],
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

describe('questionRequirementsMet', () => {
  let requestForm;

  beforeEach(() => {
    requestForm = new RequestForm(COSMIC_SERVICE);
  });

  it('is true when there are no questions', () => {
    requestForm = new RequestForm();
    expect(requestForm.questionRequirementsMet).toEqual(true);
  });

  it('is false if required questions don’t have values', () => {
    expect(requestForm.questionRequirementsMet).toEqual(false);
  });

  it('is true if required questions have valid values', () => {
    const avengersQuestion = requestForm.questions.find(
      ({ code }) => code === 'SR-AVENG'
    );
    if (!avengersQuestion) {
      throw new Error('missing');
    }

    avengersQuestion.value = 'great-lakes';

    expect(requestForm.questionRequirementsMet).toEqual(true);
  });

  it('is false if required questions have invalid values', () => {
    const avengersQuestion = requestForm.questions.find(
      ({ code }) => code === 'SR-AVENG'
    );
    if (!avengersQuestion) {
      throw new Error('missing');
    }

    avengersQuestion.value = 'fantastic-four';

    expect(requestForm.questionRequirementsMet).toEqual(false);
  });

  test('visibility of required question', () => {
    const avengersQuestion = requestForm.questions.find(
      ({ code }) => code === 'SR-AVENG'
    );
    if (!avengersQuestion) {
      throw new Error('missing');
    }

    const whoQuestion = requestForm.questions.find(
      ({ code }) => code === 'MR-WHO'
    );
    if (!whoQuestion) {
      throw new Error('missing');
    }

    const capQuestion = requestForm.questions.find(
      ({ code }) => code === 'SR-CAP'
    );
    if (!capQuestion) {
      throw new Error('missing');
    }

    expect(requestForm.questionRequirementsMet).toEqual(false);

    avengersQuestion.value = 'mcu';
    expect(requestForm.questionRequirementsMet).toEqual(true);

    whoQuestion.value = ['captain-america'];
    expect(requestForm.questionRequirementsMet).toEqual(false);

    capQuestion.value = 'Danielle Cage';
    expect(requestForm.questionRequirementsMet).toEqual(true);
  });
});
