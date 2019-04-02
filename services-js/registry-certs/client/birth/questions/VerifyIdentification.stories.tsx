import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import { BirthCertificateRequestInformation } from '../../types';

import VerifyIdentification from './VerifyIdentification';
import UploadableFile from '../../models/UploadableFile';

function makeBirthCertificateRequest(
  answers: Partial<BirthCertificateRequestInformation> = {}
): BirthCertificateRequest {
  const birthCertificateRequest = new BirthCertificateRequest();
  birthCertificateRequest.answerQuestion(answers);
  return birthCertificateRequest;
}

const commonAttributes = {
  siteAnalytics: {} as any,
  handleProceed: () => {},
  handleStepBack: () => {},
};

storiesOf('Birth/Question Components/VerifyIdentification', module)
  .add('default', () => (
    <div className="b-c b-c--hsm">
      <VerifyIdentification
        {...commonAttributes}
        birthCertificateRequest={makeBirthCertificateRequest()}
      />
    </div>
  ))
  .add('existing images and files', () => (
    <div className="b-c b-c--hsm">
      <VerifyIdentification
        {...commonAttributes}
        birthCertificateRequest={makeBirthCertificateRequest({
          forSelf: true,
          parentsMarried: 'no',
          idImageFront: new UploadableFile(SAMPLE_FILE, ''),
          supportingDocuments: [
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
          ],
        })}
      />
    </div>
  ))
  .add('upload error', () => (
    <div className="b-c b-c--hsm">
      <VerifyIdentification
        {...commonAttributes}
        birthCertificateRequest={makeBirthCertificateRequest({
          forSelf: true,
          parentsMarried: 'no',
          idImageFront: Object.assign(new UploadableFile(SAMPLE_FILE, ''), {
            status: 'uploadError',
            errorMessage: 'Upload failed: Request Timeout',
          }),
          supportingDocuments: [
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
          ],
        })}
      />
    </div>
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
