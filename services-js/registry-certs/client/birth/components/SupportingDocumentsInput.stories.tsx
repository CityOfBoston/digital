import React from 'react';
import { storiesOf } from '@storybook/react';

import SupportingDocumentsInput from './SupportingDocumentsInput';
import UploadableFile, { Status } from '../../models/UploadableFile';

function sampleFile(status: Status, progress?: number) {
  return new UploadableFile(
    new File([], 'sample.pdf', { type: 'application/pdf' }),
    'sampleId',
    status,
    progress
  );
}

storiesOf('Birth/SupportingDocumentsInput', module)
  .add('empty', () => (
    <SupportingDocumentsInput
      selectedFiles={[]}
      uploadSessionId="id"
      handleInputChange={() => {}}
    />
  ))
  .add('documents uploading', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('uploading', 23)]}
      handleInputChange={() => {}}
    />
  ))
  .add('documents successfully uploaded', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('success')]}
      handleInputChange={() => {}}
    />
  ))
  .add('error uploading one document', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('uploadError')]}
      handleInputChange={() => {}}
    />
  ))
  .add('error deleting document', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('deletionError')]}
      handleInputChange={() => {}}
    />
  ))
  .add('cancel in progress', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('canceling')]}
      handleInputChange={() => {}}
    />
  ))
  .add('delete in progress', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('deleting')]}
      handleInputChange={() => {}}
    />
  ))
  .add('all three statuses', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[
        sampleFile('uploading', 70),
        sampleFile('success'),
        sampleFile('uploadError'),
      ]}
      handleInputChange={() => {}}
    />
  ));
