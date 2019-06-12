/** @jsx jsx */

import { jsx } from '@emotion/core';

import { storiesOf } from '@storybook/react';

import VerifyIdentificationComponent from './VerifyIdentificationComponent';
import UploadableFile from '../../models/UploadableFile';

const commonAttributes = {
  siteAnalytics: {} as any,
  uploadSessionId: '.',
  supportingDocuments: [],
  updateSupportingDocuments: () => {},
  updateIdImages: () => {},
};

storiesOf(
  'Common Components/Question Components/VerifyIdentificationComponent',
  module
)
  .add('default', () => (
    <VerifyIdentificationComponent
      {...commonAttributes}
      certificateType="birth"
    />
  ))
  .add('existing images and files', () => (
    <VerifyIdentificationComponent
      {...commonAttributes}
      certificateType="marriage"
      idImageFront={new UploadableFile(SAMPLE_FILE, '')}
      supportingDocuments={[
        Object.assign(
          new UploadableFile(
            new File([], 'Deadname to Finnegan change.pdf'),
            ''
          ),
          { status: 'success' }
        ),
        Object.assign(
          new UploadableFile(
            new File([], 'Finnegan to Fiona name change.pdf'),
            ''
          ),
          { status: 'success' }
        ),
      ]}
    />
  ))
  .add('reloaded images', () => (
    <VerifyIdentificationComponent
      {...commonAttributes}
      certificateType="marriage"
      idImageFront={UploadableFile.fromRecord(
        { attachmentKey: '4', name: 'id.jpg' },
        'test'
      )}
      supportingDocuments={[
        UploadableFile.fromRecord(
          { attachmentKey: '5', name: 'Deadname to Finnegan change.pdf' },
          'test'
        ),
        UploadableFile.fromRecord(
          { attachmentKey: '6', name: 'Finnegan to Fiona name change.pdf' },
          'test'
        ),
      ]}
    />
  ))
  .add('upload error', () => (
    <VerifyIdentificationComponent
      {...commonAttributes}
      certificateType="marriage"
      idImageFront={Object.assign(new UploadableFile(SAMPLE_FILE, ''), {
        status: 'uploadError',
        errorMessage: 'Upload failed: Request Timeout',
      })}
      supportingDocuments={[
        Object.assign(
          new UploadableFile(
            new File([], 'Deadname to Finnegan change.pdf'),
            ''
          ),
          { status: 'canceling' }
        ),
        Object.assign(
          new UploadableFile(
            new File([], 'Finnegan to Fiona name change.pdf'),
            ''
          ),
          {
            status: 'uploadError',
            errorMessage: 'Network error during upload',
          }
        ),
        Object.assign(
          new UploadableFile(new File([], 'cats on cats on cats.jpg'), ''),
          {
            status: 'deletionError',
          }
        ),
      ]}
    />
  ));

const SVG_IMAGE = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">
  <g fill-rule="evenodd">
    <rect width="800" height="192" fill="#d60270"/>
    <rect width="800" height="96" y="192" fill="#9b4f96"/>
    <rect width="800" height="192" y="288" fill="#0038a8"/>
  </g>
</svg>`;

const SAMPLE_FILE = new File([SVG_IMAGE], 'id.svg', {
  type: 'image/svg+xml',
});
