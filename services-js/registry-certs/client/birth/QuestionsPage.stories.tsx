import React from 'react';
import { storiesOf } from '@storybook/react';

import { BirthCertificateRequestInformation } from '../types';
import BirthCertificateRequest from '../store/BirthCertificateRequest';

import QuestionsPage from './QuestionsPage';
import UploadableFile from '../models/UploadableFile';

function makeBirthCertificateRequest(
  answers: Partial<BirthCertificateRequestInformation> = {}
): BirthCertificateRequest {
  const birthCertificateRequest = new BirthCertificateRequest();
  birthCertificateRequest.answerQuestion(answers);
  return birthCertificateRequest;
}

storiesOf('Birth/QuestionsFlow/1. Who is this for?', module)
  .add('blank', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="forWhom"
      birthCertificateRequest={makeBirthCertificateRequest()}
    />
  ))
  .add('for someone else', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="forWhom"
      birthCertificateRequest={makeBirthCertificateRequest({ forSelf: false })}
    />
  ));

storiesOf('Birth/QuestionsFlow/1a. Client instructions', module).add(
  'default',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="clientInstructions"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: false,
        howRelated: 'client',
      })}
    />
  )
);

storiesOf('Birth/QuestionsFlow/2. Born in Boston?', module)
  .add('blank', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="bornInBoston"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
      })}
    />
  ))
  .add('maybe no', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="bornInBoston"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
        bornInBoston: 'unknown',
        parentsLivedInBoston: 'unknown',
      })}
    />
  ))
  .add('hard no', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="bornInBoston"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
        bornInBoston: 'no',
        parentsLivedInBoston: 'no',
      })}
    />
  ));

storiesOf('Birth/QuestionsFlow/3. Personal information', module).add(
  'blank',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="personalInformation"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
      })}
    />
  )
);

storiesOf('Birth/QuestionsFlow/4. Parental information', module)
  .add('blank', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="parentalInformation"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: false,
        firstName: 'Stacy',
      })}
    />
  ))
  .add('may be restricted (self)', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="parentalInformation"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
        firstName: 'Stacy',
        parentsMarried: 'no',
      })}
    />
  ))
  .add('may be restricted (other)', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="parentalInformation"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: false,
        firstName: 'Stacy',
        parentsMarried: 'unknown',
      })}
    />
  ));

storiesOf('Birth/QuestionsFlow/5. Identity verification', module)
  .add('blank', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="verifyIdentification"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
        parentsMarried: 'no',
      })}
    />
  ))
  .add('existing images and files', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="verifyIdentification"
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
  ))
  .add('upload error', () => (
    <QuestionsPage
      currentStep="verifyIdentification"
      siteAnalytics={{} as any}
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
