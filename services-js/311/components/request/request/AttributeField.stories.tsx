import React from 'react';
import { storiesOf } from '@storybook/react';
import FormDialog from '../../common/FormDialog';
import Question from '../../../data/store/Question';
import AttributeField from './AttributeField';
import {
  ServiceAttributeDatatype,
  ServiceAttributeConditionalClause,
  ServiceAttributeConditionalOp,
  ServiceAttributeConditionValueType,
} from '../../../data/queries/types';
import { ServiceAttribute } from '../../../data/types';

const makeQuestion = (
  attrs: { type: ServiceAttributeDatatype } & Partial<ServiceAttribute>,
  value: string | string[] = ''
) => {
  const question = new Question({
    code: '',
    conditionalValues: null,
    dependencies: null,
    description: '',
    required: false,
    validations: [],
    values: null,
    ...attrs,
  });

  question.value = value;

  return question;
};

storiesOf('AttributeField', module)
  .addDecorator(story => (
    <div className="b-c">
      <FormDialog>{story()}</FormDialog>
    </div>
  ))
  .add('Boolean Checkbox', () => (
    <AttributeField
      question={makeQuestion(
        {
          type: ServiceAttributeDatatype.BOOLEAN_CHECKBOX,
          code: 'ST-CMTS',
          description: 'I solemnly swear that I am up to no good',
        },
        'false'
      )}
    />
  ))
  .add('Text', () => (
    <AttributeField
      question={makeQuestion(
        {
          type: ServiceAttributeDatatype.TEXT,
          code: 'ST-CMTS',
          description: 'Please provide any other relevant information:',
        },
        'Things got bad after Thanos showed up.\n\nPlease send immediate assistance.'
      )}
    />
  ))
  .add('Informational', () => (
    <AttributeField
      question={makeQuestion({
        type: ServiceAttributeDatatype.INFORMATIONAL,
        code: 'INFO-NEDRMV1',
        description:
          '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
      })}
    />
  ))
  .add('String', () => (
    <AttributeField
      question={makeQuestion(
        {
          type: ServiceAttributeDatatype.STRING,
          code: 'INFO-NEDRMV1',
          description: 'What Earth timeline does this problem appear in?',
        },
        'Post–Zero Day'
      )}
    />
  ))
  .add('Date/Time', () => (
    // This Storyshot assumes Eastern time zone. If it fails, set your TZ
    // environment variable to America/New_York
    <AttributeField
      question={makeQuestion(
        {
          type: ServiceAttributeDatatype.DATETIME,
          code: 'INFO-NEDRMV1',
          description: 'What time is it where you are now?',
        },
        '1990-12-31T23:05:00Z'
      )}
    />
  ))
  .add('Date', () => (
    <AttributeField
      question={makeQuestion(
        {
          type: ServiceAttributeDatatype.DATE,
          code: 'INFO-NEDRMV1',
          description: 'When are you currently in time?',
        },
        '1965-12-31'
      )}
    />
  ))
  .add('Bad Date', () => (
    <AttributeField
      question={makeQuestion(
        {
          type: ServiceAttributeDatatype.DATE,
          code: 'INFO-NEDRMV1',
          description: 'When are you currently in time?',
        },
        '5'
      )}
    />
  ))
  .add('Number', () => (
    <AttributeField
      question={makeQuestion(
        {
          type: ServiceAttributeDatatype.NUMBER,
          code: 'INFO-NEDRMV1',
          description: 'How many Doombots are at your present location?',
        },
        '15'
      )}
    />
  ))
  .add('Number with validations', () => (
    <AttributeField
      question={makeQuestion(
        {
          required: true,
          type: ServiceAttributeDatatype.NUMBER,
          code: 'INT-FF',
          description: 'How many Fantastic Four do you need?',
          validations: [
            {
              dependentOn: {
                clause: ServiceAttributeConditionalClause.OR,
                conditions: [
                  {
                    attribute: 'INT-FF',
                    op: ServiceAttributeConditionalOp.gt,
                    value: {
                      type: ServiceAttributeConditionValueType.NUMBER,
                      string: null,
                      array: null,
                      number: 0,
                    },
                  },
                ],
              },
              message: 'Must need at least 1 member',
              reportOnly: false,
            },
            {
              dependentOn: {
                clause: ServiceAttributeConditionalClause.OR,
                conditions: [
                  {
                    attribute: 'INT-FF',
                    op: ServiceAttributeConditionalOp.lte,
                    value: {
                      type: ServiceAttributeConditionValueType.NUMBER,
                      string: null,
                      array: null,
                      number: 4,
                    },
                  },
                ],
              },
              message:
                'Beyond 4 Fantastic Four we will need to dig into some AUs',
              reportOnly: true,
            },
          ],
          dependencies: null,
          values: null,
          conditionalValues: null,
        },
        '0'
      )}
    />
  ))
  .add('Single Value List', () => (
    <AttributeField
      question={makeQuestion({
        type: ServiceAttributeDatatype.SINGLEVALUELIST,
        code: 'SR-NEDRMV1',
        description: 'How many dimensions were breached?',
        values: [
          { key: 'One', name: 'One' },
          { key: 'Two', name: 'Two' },
          { key: 'Three', name: 'Three' },
          { key: 'More than Three', name: 'More than Three' },
        ],
      })}
    />
  ))
  .add('Multi Value List', () => (
    <AttributeField
      question={makeQuestion(
        {
          required: true,
          type: ServiceAttributeDatatype.MULTIVALUELIST,
          code: 'SR-NEDRMV1',
          description: 'Which Avengers should be notified?',
          values: [
            { key: 'captain-america', name: 'Captain America' },
            { key: 'hercules', name: 'Hercules' },
            { key: 'thor', name: 'Thor' },
            { key: 'wasp', name: 'Wasp' },
            { key: 'vision', name: 'Vision' },
            { key: 'ms-marvel', name: 'Ms. Marvel' },
            { key: 'spider-man', name: 'Spider-Man' },
            { key: 'captain-marvel', name: 'Captain Marvel' },
          ],
        },
        ['wasp', 'spider-man', 'captain-marvel']
      )}
    />
  ));
