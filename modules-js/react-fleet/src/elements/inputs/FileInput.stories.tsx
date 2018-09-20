import React from 'react';
import { storiesOf } from '@storybook/react';

import FileInput from './FileInput';

storiesOf('Elements/Inputs/File Input', module)
  .add('default', () => (
    <FileInput
      name="resume"
      title="Resumé"
      fileTypes={['application/pdf']}
      sizeLimit={{quantity: 28, unit: 'MB'}}
    />
  ))
  .add('small size limit; no file restrictions', () => (
    <FileInput
      name="coverLetter"
      title="Cover Letter"
      fileTypes={['*']}
      sizeLimit={{quantity: 10, unit: 'KB'}}
    />
  ));
