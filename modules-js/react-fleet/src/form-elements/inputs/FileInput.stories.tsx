import React from 'react';
import { storiesOf } from '@storybook/react';

import FileInput from './FileInput';

storiesOf('Form Elements/Inputs/File Input', module)
  .add('default', () => (
    <FileInput
      name="resume"
      title="Resumé"
      fileTypes={['application/pdf']}
      sizeLimit={{amount: 28, unit: 'MB'}}
    />
  ))
  .add('small size limit; no file restrictions', () => (
    <FileInput
      name="coverLetter"
      title="Cover Letter"
      fileTypes={['*']}
      sizeLimit={{amount: 10, unit: 'KB'}}
    />
  ));
