import React from 'react';
import { storiesOf } from '@storybook/react';

import FileInput from './FileInput';

storiesOf('Form Elements|Inputs/FileInput', module)
  .add('default', () => (
    <FileInput
      name="pdf"
      title="PDF"
      fileTypes={['application/pdf']}
      sizeLimit={{ amount: 28, unit: 'MB' }}
      handleChange={() => {}}
    />
  ))
  .add('Small size limit; unspecified file type', () => (
    <FileInput
      name="coverLetter"
      title="Cover Letter"
      sizeLimit={{ amount: 10, unit: 'KB' }}
      handleChange={() => {}}
    />
  ))
  .add('Multiple file types', () => (
    <FileInput
      name="multi"
      title="JPG or PNG"
      fileTypes={['image/jpeg', 'image/png']}
      sizeLimit={{ amount: 10, unit: 'MB' }}
      handleChange={() => {}}
    />
  ));
