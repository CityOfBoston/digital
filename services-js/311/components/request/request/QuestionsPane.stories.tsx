import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { Service } from '../../../data/types';
import RequestForm from '../../../data/store/RequestForm';

import QuestionsPane from './QuestionsPane';
import FormDialog from '../../common/FormDialog';
import {
  MetadataRequirement,
  ServiceAttributeDatatype,
} from '../../../data/queries/types';

export const DEFAULT_SERVICE: Service = {
  name: 'Cosmic Incursion',
  description: 'Bad things getting in from other universes',
  code: 'CSMCINC',
  attributes: [],
  contactRequirement: MetadataRequirement.REQUIRED,
  locationRequirement: MetadataRequirement.VISIBLE,
};

export const SERVICE_WITH_METADATA: Service = {
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
  ],
};
const makeRequestForm = (service: Service, description: boolean) => {
  const requestForm = new RequestForm(service);
  if (description) {
    requestForm.description = 'I could use some heroic support';
  }

  return requestForm;
};

storiesOf('QuestionsPane', module)
  .addDecorator(story => (
    <div className="b-c">
      <FormDialog>{story()}</FormDialog>
    </div>
  ))
  .add('No Metadata', () => (
    <QuestionsPane
      requestForm={makeRequestForm(DEFAULT_SERVICE, true)}
      serviceName={'Cosmic Incursion'}
      serviceDescription={'Bad things getting in from other universes'}
      nextFunc={action('Next Step')}
      nextIsSubmit
    />
  ))
  .add('No Description', () => (
    <QuestionsPane
      requestForm={makeRequestForm(DEFAULT_SERVICE, false)}
      serviceName={'Cosmic Incursion'}
      serviceDescription={'Bad things getting in from other universes'}
      nextFunc={action('Next Step')}
      nextIsSubmit
    />
  ))
  .add('With Metadata', () => (
    <QuestionsPane
      requestForm={makeRequestForm(SERVICE_WITH_METADATA, true)}
      serviceName={'Cosmic Incursion'}
      serviceDescription={'Bad things getting in from other universes'}
      nextFunc={action('Next Step')}
      nextIsSubmit={false}
    />
  ));
