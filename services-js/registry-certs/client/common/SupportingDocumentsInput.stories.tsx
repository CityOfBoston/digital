import React from 'react';
import { storiesOf } from '@storybook/react';

import SupportingDocumentsInput from './SupportingDocumentsInput';
import UploadableFile, { Status } from '../models/UploadableFile';

function sampleFile(status: Status, progress: number = 0) {
  return Object.assign(
    new UploadableFile(
      new File([], `sample-${status}.pdf`, { type: 'application/pdf' }),
      'sampleId'
    ),
    {
      status,
      progress,
    }
  );
}

storiesOf('Common Components/SupportingDocumentsInput', module)
  .add('empty', () => (
    <SupportingDocumentsInput
      selectedFiles={[]}
      uploadSessionId="id"
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
      certificateType="birth"
    />
  ))
  .add('documents uploading', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('uploading', 23)]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
      certificateType="birth"
    />
  ))
  .add('documents successfully uploaded', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('success')]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
      certificateType="birth"
    />
  ))
  .add('error uploading one document', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('uploadError')]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
      certificateType="birth"
    />
  ))
  .add('error deleting document', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('deletionError')]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
      certificateType="birth"
    />
  ))
  .add('cancel in progress', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('canceling')]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
      certificateType="birth"
    />
  ))
  .add('delete in progress', () => (
    <SupportingDocumentsInput
      uploadSessionId="id"
      selectedFiles={[sampleFile('deleting')]}
      handleInputChange={() => {}}
      acceptTypes="application/pdf"
      certificateType="birth"
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
      certificateType="birth"
    />
  ));
