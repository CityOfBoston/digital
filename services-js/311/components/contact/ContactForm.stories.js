import React from 'react';
import { storiesOf } from '@kadira/storybook';
import ContactForm from './ContactForm';
import FormDialog from '../common/FormDialog';

storiesOf('ContactForm', module)
  .add('Dialog', () => (
    <FormDialog>
      <ContactForm title="311: Boston City Services" />
    </FormDialog>
  ));

