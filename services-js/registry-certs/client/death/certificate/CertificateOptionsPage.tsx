/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component } from 'react';
import Router from 'next/router';
import Head from 'next/head';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import {
  ProgressBar,
  RadioGroup,
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
  WHITE,
  MEDIA_SMALL,
} from '@cityofboston/react-fleet';
import { getParam } from '@cityofboston/next-client-common';

import { PageDependencies, GetInitialProps } from '../../../pages/_app';
import { DeathCertificate } from '../../types';
import PageLayout from '../../PageLayout';
import UploadableFile from '../../models/UploadableFile';
import {
  createDeathCertificateUploadSessionId,
  deathIdentityAttachmentLabel,
  deathIdentityDocumentSelectOptions,
  deathRelationshipAttachmentLabel,
  deathRelationshipSelectOptions,
  DeathCertificateIdentityDocumentType,
  DeathCertificateRelationship,
  DEATH_IDENTITY_DOCUMENT_OPTIONS,
  DEATH_RELATIONSHIP_OPTIONS,
} from '../../store/DeathCertificateCart';
import DeathSelectField from './DeathSelectField';
import DeathDocumentsUpload from './DeathDocumentsUpload';

import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';
import { DEATH_SSN_DOCUMENTATION_URL } from '../../../lib/deathSsnNotice';

interface InitialProps {
  id: string;
  quantity: number;
  backUrl: string | null;
  certificate: DeathCertificate | null;
}

interface Props
  extends InitialProps,
    Pick<PageDependencies, 'deathCertificateCart' | 'siteAnalytics'> {}

const RELATIONSHIP_OPTIONS = deathRelationshipSelectOptions();
const IDENTITY_DOCUMENT_OPTIONS = deathIdentityDocumentSelectOptions();

/**
 * STEP 3 — Certificate options for a single death certificate line item.
 * Layout and copy follow Figma “STEP 3- CERTIFICATE OPTIONS”.
 *
 * Reuses ProgressBar, RadioGroup, and standard `btn` buttons.
 * Select / upload / verification chrome are custom for this step.
 */
@observer
export default class CertificateOptionsPage extends Component<Props> {
  @observable includeSsn: boolean | null = null;
  @observable relationship: DeathCertificateRelationship | '' = '';
  @observable identityDocumentType: DeathCertificateIdentityDocumentType = '';
  @observable uploadSessionId: string = createDeathCertificateUploadSessionId();
  @observable.ref relationshipDocuments: UploadableFile[] = [];
  @observable.ref identityDocuments: UploadableFile[] = [];

  static getInitialProps: GetInitialProps<
    InitialProps,
    'query' | 'res',
    'deathCertificatesDao'
  > = async ({ query, res }, { deathCertificatesDao }) => {
    const id = getParam(query.id);

    if (!id) {
      throw new Error('Missing id');
    }

    const quantityParam = parseInt(getParam(query.quantity) || '1', 10);
    const quantity =
      Number.isFinite(quantityParam) && quantityParam > 0
        ? Math.min(99, quantityParam)
        : 1;

    const certificate = await deathCertificatesDao.get(id);

    if (!certificate && res) {
      res.statusCode = 404;
    }

    return {
      id,
      quantity,
      certificate,
      backUrl: getParam(query.backUrl, null),
    };
  };

  constructor(props: Props) {
    super(props);
    this.loadForCertificate(props.id);
  }

  /**
   * Next.js reuses this page instance when only the query changes (e.g. Edit
   * on cart item B after viewing item A). Re-seed local state whenever `id`
   * changes so uploads and SSN answers stay attached to the right line item.
   */
  componentDidUpdate(prevProps: Props) {
    if (prevProps.id !== this.props.id) {
      this.loadForCertificate(this.props.id);
    }
  }

  private loadForCertificate = action(
    'CertificateOptionsPage loadForCertificate',
    (certificateId: string) => {
      const existing = this.props.deathCertificateCart.getEntry(certificateId);

      if (existing) {
        this.includeSsn = existing.includeSsn;
        this.relationship = existing.relationship;
        this.identityDocumentType = existing.identityDocumentType;
        this.uploadSessionId =
          existing.uploadSessionId || createDeathCertificateUploadSessionId();
        this.relationshipDocuments = existing.relationshipDocuments.slice();
        this.identityDocuments = existing.identityDocuments.slice();
        return;
      }

      this.includeSsn = null;
      this.relationship = '';
      this.identityDocumentType = '';
      this.uploadSessionId = createDeathCertificateUploadSessionId();
      this.relationshipDocuments = [];
      this.identityDocuments = [];
    }
  );

  private handleSsnChange = action(
    'CertificateOptionsPage handleSsnChange',
    (ev: ChangeEvent<HTMLInputElement>) => {
      this.includeSsn = ev.currentTarget.value === 'yes';

      if (!this.includeSsn) {
        this.relationship = '';
        this.identityDocumentType = '';
        this.relationshipDocuments = [];
        this.identityDocuments = [];
      }
    }
  );

  private handleRelationshipChange = action(
    'CertificateOptionsPage handleRelationshipChange',
    (ev: ChangeEvent<HTMLSelectElement>) => {
      this.relationship = ev.currentTarget
        .value as DeathCertificateRelationship | '';
    }
  );

  private handleIdentityDocumentTypeChange = action(
    'CertificateOptionsPage handleIdentityDocumentTypeChange',
    (ev: ChangeEvent<HTMLSelectElement>) => {
      this.identityDocumentType = ev.currentTarget
        .value as DeathCertificateIdentityDocumentType;
    }
  );

  private handleRelationshipDocumentsChange = action(
    'CertificateOptionsPage handleRelationshipDocumentsChange',
    (files: UploadableFile[]) => {
      this.relationshipDocuments = files;
    }
  );

  private handleIdentityDocumentsChange = action(
    'CertificateOptionsPage handleIdentityDocumentsChange',
    (files: UploadableFile[]) => {
      this.identityDocuments = files;
    }
  );

  private uploadsPending(): boolean {
    const all = [...this.relationshipDocuments, ...this.identityDocuments];
    return all.some(
      file =>
        file.status === 'uploading' ||
        file.status === 'canceling' ||
        file.status === 'deleting'
    );
  }

  private uploadsFailed(): boolean {
    const all = [...this.relationshipDocuments, ...this.identityDocuments];
    return all.some(
      file => file.status === 'uploadError' || file.status === 'deletionError'
    );
  }

  private isComplete(): boolean {
    if (
      this.includeSsn === null ||
      this.uploadsPending() ||
      this.uploadsFailed()
    ) {
      return false;
    }

    if (!this.includeSsn) {
      return true;
    }

    return !!(
      this.relationship &&
      this.identityDocumentType &&
      this.relationshipDocuments.some(file => file.status === 'success') &&
      this.identityDocuments.some(file => file.status === 'success')
    );
  }

  private handleStepBack = async () => {
    const { id, backUrl } = this.props;
    const href = backUrl
      ? `/death/certificate?id=${encodeURIComponent(
          id
        )}&backUrl=${encodeURIComponent(backUrl)}`
      : `/death/certificate?id=${encodeURIComponent(id)}`;

    await Router.push(href);
    window.scroll(0, 0);
  };

  private handleAddToOrder = action(async () => {
    const {
      certificate,
      quantity,
      deathCertificateCart,
      siteAnalytics,
    } = this.props;

    if (!certificate || !this.isComplete()) {
      return;
    }

    deathCertificateCart.setCertificateOptions(certificate, quantity, {
      includeSsn: this.includeSsn,
      relationship: this.includeSsn ? this.relationship : '',
      identityDocumentType: this.includeSsn ? this.identityDocumentType : '',
      uploadSessionId: this.uploadSessionId,
      relationshipDocuments: this.includeSsn ? this.relationshipDocuments : [],
      identityDocuments: this.includeSsn ? this.identityDocuments : [],
    });

    siteAnalytics.sendEvent('click', {
      category: 'UX',
      label: 'add to cart',
    });

    await Router.push('/death/cart');
    window.scroll(0, 0);
  });

  render() {
    const { id, certificate, deathCertificateCart } = this.props;

    return (
      <PageLayout
        showNav
        cart={deathCertificateCart}
        breadcrumbNav={BREADCRUMB_NAV_LINKS.death}
      >
        <div className="b-c b-c--nbp" css={PAGE_STYLING}>
          <Head>
            <title>
              Boston.gov — Death Certificates — Certificate Options
            </title>
          </Head>

          <h1 css={PAGE_TITLE_STYLING}>Request a death certificate</h1>

          <div css={PROGRESS_WRAP_STYLING}>
            <ProgressBar
              totalSteps={7}
              currentStep={3}
              currentStepCompleted={this.isComplete()}
            />
          </div>

          <h2 css={SECTION_TITLE_STYLING}>Certificate options</h2>

          {!certificate && (
            <div className="t--info m-v300">
              We could not find a certificate with ID #{id}.
            </div>
          )}

          {certificate && this.renderForm()}
        </div>
      </PageLayout>
    );
  }

  private renderForm() {
    return (
      <div css={FORM_STYLING}>
        <div css={INTRO_STYLING}>
          <p>
            By law, SSNs are not included on Massachusetts death certificates
            unless the requester has a legitimate need and provides supporting
            documentation.{' '}
            <a
              href={DEATH_SSN_DOCUMENTATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              css={INTRO_LINK_STYLING}
            >
              Why do we need to know?
            </a>
          </p>
          <p>
            Selecting “Yes” requires documentation and review before your
            request can be approved.
          </p>
        </div>

        <fieldset css={FIELDSET_STYLING}>
          <legend css={QUESTION_LEGEND_STYLING}>
            Would you like the decedent’s Social Security Number (SSN) printed
            on the death certificate?{' '}
            <span className="t--req">Required</span>
          </legend>

          <div css={RADIO_WRAP_STYLING}>
            <RadioGroup
              name="includeSsn"
              groupLabel="SSN preference"
              hideLabel
              softRequired
              checkedValue={
                this.includeSsn === null
                  ? undefined
                  : this.includeSsn
                    ? 'yes'
                    : 'no'
              }
              items={[
                {
                  label: 'No, do not include the SSN',
                  value: 'no',
                },
                {
                  label: 'Yes, include the SSN',
                  value: 'yes',
                },
              ]}
              handleItemChange={this.handleSsnChange}
            />
          </div>
        </fieldset>

        <div css={NOTE_STYLING}>
          <img
            src="/assets/images/death-ssn-alert.svg"
            alt=""
            width={30}
            height={30}
          />
          <p>
            Your SSN selection will apply to all copies of this death
            certificate in this order
          </p>
        </div>

        {this.includeSsn === true && this.renderVerificationSection()}

        <div css={BUTTON_ROW_STYLING}>
          <button
            type="button"
            css={SECONDARY_BUTTON_STYLING}
            onClick={this.handleStepBack}
          >
            Back
          </button>
          <button
            type="button"
            className="btn"
            css={PRIMARY_BUTTON_STYLING}
            onClick={this.handleAddToOrder}
            disabled={!this.isComplete()}
          >
            Add to order
          </button>
        </div>
      </div>
    );
  }

  private renderVerificationSection() {
    const relationshipDoc =
      this.relationship &&
      DEATH_RELATIONSHIP_OPTIONS[this.relationship].requiredDocument;
    const identityDoc =
      this.identityDocumentType &&
      DEATH_IDENTITY_DOCUMENT_OPTIONS[this.identityDocumentType]
        .requiredDocument;

    return (
      <div>
        <h3 css={VERIFICATION_TITLE_STYLING}>
          Additional verification required
        </h3>

        <div css={VERIFICATION_BOX_STYLING}>
          <div css={FIELD_BLOCK_STYLING}>
            <DeathSelectField
              label="Your Relationship to the Decedent"
              name="relationship"
              required
              options={RELATIONSHIP_OPTIONS}
              value={this.relationship}
              onChange={this.handleRelationshipChange}
            />
            {relationshipDoc && (
              <p css={REQUIRED_DOC_STYLING}>
                <strong>Required document:</strong> {relationshipDoc}{' '}
                <a
                  href={DEATH_SSN_DOCUMENTATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View accepted document
                </a>
              </p>
            )}
          </div>

          {this.relationship && (
            <div css={FIELD_BLOCK_STYLING}>
              <div css={UPLOAD_LABEL_STYLING}>
                Upload Proof of Relationship or Authority{' '}
                <span className="t--req">Required</span>
              </div>
              <DeathDocumentsUpload
                certificateType="death"
                uploadSessionId={this.uploadSessionId}
                selectedFiles={this.relationshipDocuments}
                handleInputChange={this.handleRelationshipDocumentsChange}
                acceptTypes="image/jpeg,image/jpg,application/pdf,.jpg,.jpeg,.pdf"
                attachmentLabel={deathRelationshipAttachmentLabel(
                  this.relationship
                )}
                inputId="death-relationship-upload"
                buttonText="Upload file"
              />
            </div>
          )}

          <div css={FIELD_BLOCK_STYLING}>
            <DeathSelectField
              label="Proof of Identity"
              name="identityDocumentType"
              required
              options={IDENTITY_DOCUMENT_OPTIONS}
              value={this.identityDocumentType}
              onChange={this.handleIdentityDocumentTypeChange}
            />
            {identityDoc && (
              <p css={REQUIRED_DOC_STYLING}>
                <strong>Required document:</strong> {identityDoc}{' '}
                <a
                  href={DEATH_SSN_DOCUMENTATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View accepted document
                </a>
              </p>
            )}
          </div>

          {this.identityDocumentType && (
            <div css={FIELD_BLOCK_STYLING}>
              <div css={UPLOAD_LABEL_STYLING}>
                Upload Proof of Identity{' '}
                <span className="t--req">Required</span>
              </div>
              <DeathDocumentsUpload
                certificateType="death"
                uploadSessionId={this.uploadSessionId}
                selectedFiles={this.identityDocuments}
                handleInputChange={this.handleIdentityDocumentsChange}
                acceptTypes="image/jpeg,image/jpg,application/pdf,.jpg,.jpeg,.pdf"
                attachmentLabel={deathIdentityAttachmentLabel(
                  this.identityDocumentType
                )}
                inputId="death-identity-upload"
                buttonText="Upload file"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const PAGE_STYLING = css({
  maxWidth: '45rem',
});

const PAGE_TITLE_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '2rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
  margin: '0 0 1.5rem',
});

const PROGRESS_WRAP_STYLING = css({
  marginBottom: '2rem',
});

const SECTION_TITLE_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.875rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
  margin: '0 0 1.5rem',
});

const FORM_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

const INTRO_STYLING = css({
  fontFamily: SERIF,
  fontSize: '1rem',
  lineHeight: 1.5,
  color: '#58585b',
  p: {
    margin: '0 0 1rem',
  },
});

const INTRO_LINK_STYLING = css({
  color: OPTIMISTIC_BLUE_DARK,
  fontSize: '1.125rem',
  textDecoration: 'underline',
});

const FIELDSET_STYLING = css({
  border: 'none',
  margin: 0,
  padding: 0,
});

const QUESTION_LEGEND_STYLING = css({
  fontFamily: SERIF,
  fontSize: '1.125rem',
  fontWeight: 700,
  color: CHARLES_BLUE,
  marginBottom: '1rem',
  padding: 0,
});

const RADIO_WRAP_STYLING = css({
  '.ra': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  '.ra:last-child': {
    marginBottom: 0,
  },
  '.ra-l': {
    fontFamily: SERIF,
    fontSize: '1.125rem',
    color: CHARLES_BLUE,
  },
});

const NOTE_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '0.4rem',
  img: {
    flexShrink: 0,
    width: 30,
    height: 30,
  },
  p: {
    margin: 0,
    fontFamily: SERIF,
    fontSize: '1rem',
    lineHeight: '1.5',
    color: '#58585b',
  },
});

const VERIFICATION_BOX_STYLING = css({
  border: '2px solid #d2d2d2',
  backgroundColor: WHITE,
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

const VERIFICATION_TITLE_STYLING = css({
  margin: '0 0 1rem',
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.125rem',
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
});

const FIELD_BLOCK_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

const REQUIRED_DOC_STYLING = css({
  margin: 0,
  fontFamily: SERIF,
  fontSize: '1rem',
  lineHeight: 1.5,
  color: CHARLES_BLUE,
  strong: {
    fontWeight: 700,
  },
  a: {
    color: CHARLES_BLUE,
  },
});

const UPLOAD_LABEL_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1rem',
  color: CHARLES_BLUE,
});

const BUTTON_ROW_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '1rem',
  marginBottom: '2rem',

  [MEDIA_SMALL]: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '1.5rem',
  },
});

const SECONDARY_BUTTON_STYLING = css({
  appearance: 'none',
  background: WHITE,
  border: '1px solid #d2d2d2',
  color: OPTIMISTIC_BLUE_DARK,
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'uppercase',
  minHeight: '55px',
  minWidth: '10rem',
  padding: '0.625rem 1rem',
  cursor: 'pointer',

  '&:hover, &:focus': {
    background: '#f3f3f3',
  },
});

const PRIMARY_BUTTON_STYLING = css({
  minHeight: '55px',
  minWidth: '10rem',
  textTransform: 'uppercase',
  fontWeight: 700,

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});
