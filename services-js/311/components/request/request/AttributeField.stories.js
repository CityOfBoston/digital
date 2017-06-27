// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import FormDialog from '../../common/FormDialog';
import Question from '../../../data/store/Question';
import AttributeField from './AttributeField';

const makeQuestion = (attrs: Object, value: string | string[] = '') => {
  const question = new Question(
    ({
      code: '',
      conditionalValues: null,
      dependencies: null,
      description: '',
      required: false,
      values: null,
      type: null,
      ...attrs,
    }: any),
  );

  question.value = value;

  return question;
};

storiesOf('AttributeField', module)
  .addDecorator(story =>
    <div className="b-c">
      <FormDialog>{story()}</FormDialog>
    </div>,
  )
  .add('Boolean Checkbox', () =>
    <AttributeField
      question={makeQuestion(
        {
          type: 'BOOLEAN_CHECKBOX',
          code: 'ST-CMTS',
          description: 'I solemnly swear that I am up to no good',
        },
        'false',
      )}
    />,
  )
  .add('Text', () =>
    <AttributeField
      question={makeQuestion(
        {
          type: 'TEXT',
          code: 'ST-CMTS',
          description: 'Please provide any other relevant information:',
        },
        'Things got bad after Thanos showed up.\n\nPlease send immediate assistance.',
      )}
    />,
  )
  .add('Informational', () =>
    <AttributeField
      question={makeQuestion({
        type: 'INFORMATIONAL',
        code: 'INFO-NEDRMV1',
        description:
          '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
      })}
    />,
  )
  .add('String', () =>
    <AttributeField
      question={makeQuestion(
        {
          type: 'STRING',
          code: 'INFO-NEDRMV1',
          description: 'What Earth timeline does this problem appear in?',
        },
        'Post–Zero Day',
      )}
    />,
  )
  .add('Date/Time', () =>
    <AttributeField
      question={makeQuestion(
        {
          type: 'DATETIME',
          code: 'INFO-NEDRMV1',
          description: 'What time is it where you are now?',
        },
        '1990-12-31T23:05:00',
      )}
    />,
  )
  .add('Date', () =>
    <AttributeField
      question={makeQuestion(
        {
          type: 'DATE',
          code: 'INFO-NEDRMV1',
          description: 'When are you currently in time?',
        },
        '1965-12-31',
      )}
    />,
  )
  .add('Bad Date', () =>
    <AttributeField
      question={makeQuestion(
        {
          type: 'DATE',
          code: 'INFO-NEDRMV1',
          description: 'When are you currently in time?',
        },
        '5',
      )}
    />,
  )
  .add('Number', () =>
    <AttributeField
      question={makeQuestion(
        {
          type: 'NUMBER',
          code: 'INFO-NEDRMV1',
          description: 'How many Doombots are at your present location?',
        },
        '15',
      )}
    />,
  )
  .add('Single Value List', () =>
    <AttributeField
      question={makeQuestion({
        type: 'SINGLEVALUELIST',
        code: 'SR-NEDRMV1',
        description: 'How many dimensions were breached?',
        values: [
          { key: 'One', name: 'One' },
          { key: 'Two', name: 'Two' },
          { key: 'Three', name: 'Three' },
          { key: 'More than Three', name: 'More than Three' },
        ],
      })}
    />,
  )
  .add('Multi Value List', () =>
    <AttributeField
      question={makeQuestion(
        {
          required: true,
          type: 'MULTIVALUELIST',
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
        ['wasp', 'spider-man', 'captain-marvel'],
      )}
    />,
  );
