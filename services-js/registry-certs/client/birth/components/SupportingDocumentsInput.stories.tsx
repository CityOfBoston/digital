import React from 'react';
import { storiesOf } from '@storybook/react';

import SupportingDocumentsInput from './SupportingDocumentsInput';
import UploadableFile, { Status } from '../../models/UploadableFile';

function sampleFile(status: Status, progress: number = 0) {
  return Object.assign(
    new UploadableFile(
      new File([], 'sample.pdf', { type: 'application/pdf' }),
      'sampleId'
    ),
    {
      status,
      progress,
    }
  );
}

storiesOf('Birth/SupportingDocumentsInput', module)
  .add('empty', () => (
    <SupportingDocumentsInput
      selectedFiles={[]}
      uploadSessionId="id"
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
    />
  ))
  .add('documents uploading', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('uploading', 23)]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
    />
  ))
  .add('documents successfully uploaded', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('success')]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
    />
  ))
  .add('error uploading one document', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('uploadError')]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
    />
  ))
  .add('error deleting document', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('deletionError')]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
    />
  ))
  .add('cancel in progress', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('canceling')]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
    />
  ))
  .add('delete in progress', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('deleting')]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
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
      acceptTypes="application/pdf"
    />
  ));
