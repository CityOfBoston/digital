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
  ERROR_BORDER_COLOR,
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
  deathIdentityAlternateSelectOptions,
  deathIdentityAttachmentLabel,
  deathIdentityDocumentSelectOptions,
  deathRelationshipAttachmentLabel,
  deathRelationshipSelectOptions,
  DeathCertificateAlternateIdentitySelection,
  DeathCertificateIdentityDocumentType,
  DeathCertificateRelationship,
  DEATH_IDENTITY_ALTERNATE_LABELS,
  DEATH_IDENTITY_ALTERNATE_OPTIONS,
  DEATH_IDENTITY_DOCUMENT_OPTIONS,
  DEATH_IDENTITY_OTHER_REQUIRED_INTRO,
  DEATH_RELATIONSHIP_OPTIONS,
  isDeathIdentityOther,
  optionRequiresMultipleFiles,
  requiredDocumentHeading,
} from '../../store/DeathCertificateCart';
import { INFO_NOTICE_BANNER } from '../../common/components';
import DeathSelectField from './DeathSelectField';
import DeathDocumentsUpload from './DeathDocumentsUpload';
import DeathDuplicateIdentityOverlay, {
  DuplicateIdentitySlot,
} from './DeathDuplicateIdentityOverlay';

import { BREADCRUMB_NAV_LINKS } from '../../../lib/breadcrumbs';
import { DEATH_SSN_DOCUMENTATION_URL } from '../../../lib/deathSsnNotice';
import {
  DEATH_APP_TITLE_STYLING,
  DEATH_PAGE_TITLE_STYLING,
} from '../deathFlowTitles';

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
const IDENTITY_ALTERNATE_OPTIONS = deathIdentityAlternateSelectOptions();
const ACCEPT_TYPES =
  'image/jpeg,image/jpg,application/pdf,.jpg,.jpeg,.pdf';

type OptionsFieldKey =
  | 'includeSsn'
  | 'relationship'
  | 'relationshipDocuments'
  | 'identityDocumentType'
  | 'identityAlternateDocumentType1'
  | 'identityDocuments'
  | 'identityAlternateDocumentType2'
  | 'identityDocumentsSecondary';

const FIELD_ERROR_MESSAGES: Record<OptionsFieldKey, string> = {
  includeSsn:
    'Please select whether to include the Social Security Number on the death certificate.',
  relationship: 'Please select your relationship to the decedent.',
  relationshipDocuments: 'Please upload proof of relationship or authority.',
  identityDocumentType: 'Please select a proof of identity document type.',
  identityAlternateDocumentType1: 'Please select a first document type.',
  identityDocuments: 'Please upload proof of identity.',
  identityAlternateDocumentType2: 'Please select a second document type.',
  identityDocumentsSecondary: 'Please upload your second proof of identity.',
};

const FIELD_FOCUS_IDS: Record<OptionsFieldKey, string> = {
  includeSsn: 'includeSsn-field',
  relationship: 'relationship',
  relationshipDocuments: 'death-relationship-upload',
  identityDocumentType: 'identityDocumentType',
  identityAlternateDocumentType1: 'identityAlternateDocumentType1',
  identityDocuments: 'death-identity-upload',
  identityAlternateDocumentType2: 'identityAlternateDocumentType2',
  identityDocumentsSecondary: 'death-identity-upload-2',
};

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
  @observable
  identityAlternateDocumentType1: DeathCertificateAlternateIdentitySelection = '';
  @observable
  identityAlternateDocumentType2: DeathCertificateAlternateIdentitySelection = '';
  @observable uploadSessionId: string = createDeathCertificateUploadSessionId();
  @observable.ref relationshipDocuments: UploadableFile[] = [];
  @observable.ref identityDocuments: UploadableFile[] = [];
  @observable.ref identityDocumentsSecondary: UploadableFile[] = [];
  /** Which alternate slot last created a duplicate selection (for undo). */
  @observable duplicateIdentitySlot: DuplicateIdentitySlot | null = null;
  /** First incomplete required field after an Add to order attempt. */
  @observable fieldError: OptionsFieldKey | null = null;

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
        this.relationship =
          existing.relationship &&
          DEATH_RELATIONSHIP_OPTIONS[existing.relationship]
            ? existing.relationship
            : '';
        this.identityDocumentType =
          existing.identityDocumentType &&
          DEATH_IDENTITY_DOCUMENT_OPTIONS[existing.identityDocumentType]
            ? existing.identityDocumentType
            : '';
        this.identityAlternateDocumentType1 =
          existing.identityAlternateDocumentType1 || '';
        this.identityAlternateDocumentType2 =
          existing.identityAlternateDocumentType2 || '';
        this.uploadSessionId =
          existing.uploadSessionId || createDeathCertificateUploadSessionId();
        this.relationshipDocuments = existing.relationshipDocuments.slice();
        this.identityDocuments = existing.identityDocuments.slice();
        this.identityDocumentsSecondary = existing.identityDocumentsSecondary.slice();
        this.duplicateIdentitySlot =
          this.identityAlternateDocumentType1 &&
          this.identityAlternateDocumentType1 ===
            this.identityAlternateDocumentType2
            ? 2
            : null;
        this.fieldError = null;
        return;
      }

      this.includeSsn = null;
      this.relationship = '';
      this.identityDocumentType = '';
      this.identityAlternateDocumentType1 = '';
      this.identityAlternateDocumentType2 = '';
      this.uploadSessionId = createDeathCertificateUploadSessionId();
      this.relationshipDocuments = [];
      this.identityDocuments = [];
      this.identityDocumentsSecondary = [];
      this.duplicateIdentitySlot = null;
      this.fieldError = null;
    }
  );

  private clearDocuments(files: UploadableFile[]) {
    files.forEach(file => {
      if (file.uploadRequest) {
        try {
          file.uploadRequest.abort();
        } catch (e) {
          // Ignore abort errors from already-finished requests.
        }
      }

      if (file.attachmentKey) {
        file.delete('death');
      }
    });
  }

  private handleSsnChange = action(
    'CertificateOptionsPage handleSsnChange',
    (ev: ChangeEvent<HTMLInputElement>) => {
      this.includeSsn = ev.currentTarget.value === 'yes';
      this.clearFieldErrorIf('includeSsn');

      if (!this.includeSsn) {
        this.clearDocuments(this.relationshipDocuments);
        this.clearDocuments(this.identityDocuments);
        this.clearDocuments(this.identityDocumentsSecondary);
        this.relationship = '';
        this.identityDocumentType = '';
        this.identityAlternateDocumentType1 = '';
        this.identityAlternateDocumentType2 = '';
        this.relationshipDocuments = [];
        this.identityDocuments = [];
        this.identityDocumentsSecondary = [];
        this.duplicateIdentitySlot = null;
        this.uploadSessionId = createDeathCertificateUploadSessionId();
      }
    }
  );

  private handleRelationshipChange = action(
    'CertificateOptionsPage handleRelationshipChange',
    (ev: ChangeEvent<HTMLSelectElement>) => {
      const next = ev.currentTarget
        .value as DeathCertificateRelationship | '';

      if (next !== this.relationship) {
        this.clearDocuments(this.relationshipDocuments);
        this.relationshipDocuments = [];
      }

      this.relationship = next;
      this.clearFieldErrorIf('relationship');
    }
  );

  private handleIdentityDocumentTypeChange = action(
    'CertificateOptionsPage handleIdentityDocumentTypeChange',
    (ev: ChangeEvent<HTMLSelectElement>) => {
      const next = ev.currentTarget
        .value as DeathCertificateIdentityDocumentType;

      if (next === this.identityDocumentType) {
        return;
      }

      this.clearDocuments(this.identityDocuments);
      this.identityDocuments = [];

      if (!isDeathIdentityOther(next)) {
        this.clearDocuments(this.identityDocumentsSecondary);
        this.identityAlternateDocumentType1 = '';
        this.identityAlternateDocumentType2 = '';
        this.identityDocumentsSecondary = [];
        this.duplicateIdentitySlot = null;
      }

      this.identityDocumentType = next;
      this.clearFieldErrorIf('identityDocumentType');
    }
  );

  private handleIdentityAlternateType1Change = action(
    'CertificateOptionsPage handleIdentityAlternateType1Change',
    (ev: ChangeEvent<HTMLSelectElement>) => {
      const next = ev.currentTarget
        .value as DeathCertificateAlternateIdentitySelection;

      if (next !== this.identityAlternateDocumentType1) {
        this.clearDocuments(this.identityDocuments);
        this.identityDocuments = [];
      }

      this.identityAlternateDocumentType1 = next;
      this.clearFieldErrorIf('identityAlternateDocumentType1');

      if (next && next === this.identityAlternateDocumentType2) {
        this.duplicateIdentitySlot = 1;
      } else {
        this.duplicateIdentitySlot = null;
        this.clearFieldErrorIf('identityAlternateDocumentType2');
      }
    }
  );

  private handleIdentityAlternateType2Change = action(
    'CertificateOptionsPage handleIdentityAlternateType2Change',
    (ev: ChangeEvent<HTMLSelectElement>) => {
      const next = ev.currentTarget
        .value as DeathCertificateAlternateIdentitySelection;

      if (next !== this.identityAlternateDocumentType2) {
        this.clearDocuments(this.identityDocumentsSecondary);
        this.identityDocumentsSecondary = [];
      }

      this.identityAlternateDocumentType2 = next;
      this.clearFieldErrorIf('identityAlternateDocumentType2');

      if (next && next === this.identityAlternateDocumentType1) {
        this.duplicateIdentitySlot = 2;
      } else {
        this.duplicateIdentitySlot = null;
        this.clearFieldErrorIf('identityAlternateDocumentType1');
      }
    }
  );

  private handleUndoDuplicateIdentity = action(
    'CertificateOptionsPage handleUndoDuplicateIdentity',
    () => {
      if (this.duplicateIdentitySlot === 1) {
        this.clearDocuments(this.identityDocuments);
        this.identityAlternateDocumentType1 = '';
        this.identityDocuments = [];
      } else if (this.duplicateIdentitySlot === 2) {
        this.clearDocuments(this.identityDocumentsSecondary);
        this.identityAlternateDocumentType2 = '';
        this.identityDocumentsSecondary = [];
      }

      this.duplicateIdentitySlot = null;
    }
  );

  private handleRelationshipDocumentsChange = action(
    'CertificateOptionsPage handleRelationshipDocumentsChange',
    (files: UploadableFile[]) => {
      this.relationshipDocuments = files;
      // Clear like dropdowns: once the user selects a file, dismiss the
      // empty-upload error (don’t wait for upload success).
      if (files.length > 0) {
        this.clearFieldErrorIf('relationshipDocuments');
      }
    }
  );

  private handleIdentityDocumentsChange = action(
    'CertificateOptionsPage handleIdentityDocumentsChange',
    (files: UploadableFile[]) => {
      this.identityDocuments = files;
      if (files.length > 0) {
        this.clearFieldErrorIf('identityDocuments');
      }
    }
  );

  private handleIdentityDocumentsSecondaryChange = action(
    'CertificateOptionsPage handleIdentityDocumentsSecondaryChange',
    (files: UploadableFile[]) => {
      this.identityDocumentsSecondary = files;
      if (files.length > 0) {
        this.clearFieldErrorIf('identityDocumentsSecondary');
      }
    }
  );

  private clearFieldErrorIf = action(
    'CertificateOptionsPage clearFieldErrorIf',
    (key: OptionsFieldKey) => {
      if (this.fieldError === key) {
        this.fieldError = null;
      }
    }
  );

  private hasSuccessfulUpload(files: UploadableFile[]): boolean {
    return files.some(file => file.status === 'success');
  }

  private uploadFieldIncomplete(files: UploadableFile[]): boolean {
    return (
      !this.hasSuccessfulUpload(files) ||
      files.some(
        file =>
          file.status === 'uploading' ||
          file.status === 'uploadError' ||
          file.status === 'deletionError' ||
          file.status === 'deleting' ||
          file.status === 'canceling'
      )
    );
  }

  private allIdentityDocuments(): UploadableFile[] {
    return [...this.identityDocuments, ...this.identityDocumentsSecondary];
  }

  private uploadsPending(): boolean {
    const all = [
      ...this.relationshipDocuments,
      ...this.allIdentityDocuments(),
    ];
    return all.some(
      file =>
        file.status === 'uploading' ||
        file.status === 'canceling' ||
        file.status === 'deleting'
    );
  }

  /**
   * First incomplete required control in document order, or null when ready.
   */
  private findFirstIncompleteField(): OptionsFieldKey | null {
    if (this.includeSsn === null) {
      return 'includeSsn';
    }

    if (!this.includeSsn) {
      return null;
    }

    if (!this.relationship) {
      return 'relationship';
    }

    if (this.uploadFieldIncomplete(this.relationshipDocuments)) {
      return 'relationshipDocuments';
    }

    if (!this.identityDocumentType) {
      return 'identityDocumentType';
    }

    if (isDeathIdentityOther(this.identityDocumentType)) {
      if (!this.identityAlternateDocumentType1) {
        return 'identityAlternateDocumentType1';
      }

      if (this.uploadFieldIncomplete(this.identityDocuments)) {
        return 'identityDocuments';
      }

      if (!this.identityAlternateDocumentType2) {
        return 'identityAlternateDocumentType2';
      }

      if (
        this.identityAlternateDocumentType1 ===
          this.identityAlternateDocumentType2 ||
        this.duplicateIdentitySlot
      ) {
        return this.duplicateIdentitySlot === 1
          ? 'identityAlternateDocumentType1'
          : 'identityAlternateDocumentType2';
      }

      if (this.uploadFieldIncomplete(this.identityDocumentsSecondary)) {
        return 'identityDocumentsSecondary';
      }

      return null;
    }

    if (this.uploadFieldIncomplete(this.identityDocuments)) {
      return 'identityDocuments';
    }

    return null;
  }

  private errorMessageFor(key: OptionsFieldKey): string {
    if (
      (key === 'relationshipDocuments' ||
        key === 'identityDocuments' ||
        key === 'identityDocumentsSecondary') &&
      this.uploadsPending()
    ) {
      return 'Please wait for your upload to finish.';
    }

    if (
      key === 'identityAlternateDocumentType1' ||
      key === 'identityAlternateDocumentType2'
    ) {
      if (
        this.identityAlternateDocumentType1 &&
        this.identityAlternateDocumentType2 &&
        this.identityAlternateDocumentType1 ===
          this.identityAlternateDocumentType2
      ) {
        return 'Please choose two different document types.';
      }
    }

    if (
      key === 'identityDocuments' &&
      isDeathIdentityOther(this.identityDocumentType)
    ) {
      return 'Please upload your first proof of identity.';
    }

    return FIELD_ERROR_MESSAGES[key];
  }

  private focusIncompleteField(key: OptionsFieldKey) {
    const focusId =
      key === 'identityDocuments' &&
      isDeathIdentityOther(this.identityDocumentType)
        ? 'death-identity-upload-1'
        : FIELD_FOCUS_IDS[key];

    // Wait for MobX/react to paint the error state before scrolling.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const el = document.getElementById(focusId);
        if (!el) {
          return;
        }

        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (key === 'includeSsn') {
          const radio = document.querySelector(
            'input[name="includeSsn"]'
          ) as HTMLInputElement | null;
          if (radio) {
            radio.focus();
          }
          return;
        }

        (el as HTMLElement).focus();
      });
    });
  }

  private isComplete(): boolean {
    return this.findFirstIncompleteField() === null;
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

    if (!certificate) {
      return;
    }

    const incomplete = this.findFirstIncompleteField();
    if (incomplete) {
      this.fieldError = incomplete;
      this.focusIncompleteField(incomplete);
      return;
    }

    this.fieldError = null;

    deathCertificateCart.setCertificateOptions(certificate, quantity, {
      includeSsn: this.includeSsn,
      relationship: this.includeSsn ? this.relationship : '',
      identityDocumentType: this.includeSsn ? this.identityDocumentType : '',
      identityAlternateDocumentType1: this.includeSsn
        ? this.identityAlternateDocumentType1
        : '',
      identityAlternateDocumentType2: this.includeSsn
        ? this.identityAlternateDocumentType2
        : '',
      uploadSessionId: this.uploadSessionId,
      relationshipDocuments: this.includeSsn ? this.relationshipDocuments : [],
      identityDocuments: this.includeSsn ? this.identityDocuments : [],
      identityDocumentsSecondary: this.includeSsn
        ? this.identityDocumentsSecondary
        : [],
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

          <h1 css={DEATH_APP_TITLE_STYLING}>Request a death certificate</h1>

          <div css={PROGRESS_WRAP_STYLING}>
            <ProgressBar
              totalSteps={7}
              currentStep={3}
              currentStepCompleted={this.isComplete()}
            />
          </div>

          <h2 css={DEATH_PAGE_TITLE_STYLING}>Certificate options</h2>

          {!certificate && (
            <div className="t--info m-v300">
              We could not find a certificate with ID #{id}.
            </div>
          )}

          {certificate && this.renderForm()}

          {this.duplicateIdentitySlot && (
            <DeathDuplicateIdentityOverlay
              slot={this.duplicateIdentitySlot}
              onChooseAnother={this.handleUndoDuplicateIdentity}
            />
          )}
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

        <fieldset
          id="includeSsn-field"
          css={[
            FIELDSET_STYLING,
            this.fieldError === 'includeSsn' && FIELDSET_ERROR_STYLING,
          ]}
        >
          <legend css={QUESTION_LEGEND_STYLING}>
            Would you like the decedent’s Social Security Number (SSN) printed
            on the death certificate?{' '}
            <span css={SELECTION_NOTE_STYLING}>
              Your selection will apply to all copies of this certificate in
              this order.
            </span>{' '}
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
          {this.fieldError === 'includeSsn' && (
            <div
              className="t--info t--err m-t200"
              id="includeSsn-error"
              role="alert"
            >
              {this.errorMessageFor('includeSsn')}
            </div>
          )}
        </fieldset>

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
            onClick={() => this.handleAddToOrder()}
          >
            Add to order
          </button>
        </div>
      </div>
    );
  }

  private renderVerificationSection() {
    const relationshipOption =
      this.relationship && DEATH_RELATIONSHIP_OPTIONS[this.relationship]
        ? DEATH_RELATIONSHIP_OPTIONS[this.relationship]
        : null;
    const relationshipDoc = relationshipOption
      ? relationshipOption.requiredDocument
      : null;
    const identityIsOther = isDeathIdentityOther(this.identityDocumentType);
    const identityOption =
      this.identityDocumentType &&
      DEATH_IDENTITY_DOCUMENT_OPTIONS[this.identityDocumentType] &&
      !identityIsOther
        ? DEATH_IDENTITY_DOCUMENT_OPTIONS[this.identityDocumentType]
        : null;
    const identityDoc = identityOption ? identityOption.requiredDocument : null;

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
              error={
                this.fieldError === 'relationship'
                  ? this.errorMessageFor('relationship')
                  : null
              }
              onChange={this.handleRelationshipChange}
            />
            {relationshipDoc && relationshipOption && (
              <INFO_NOTICE_BANNER>
                <strong>
                  {requiredDocumentHeading(
                    optionRequiresMultipleFiles(relationshipOption)
                  )}
                </strong>{' '}
                {relationshipDoc}
              </INFO_NOTICE_BANNER>
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
                acceptTypes={ACCEPT_TYPES}
                attachmentLabel={deathRelationshipAttachmentLabel(
                  this.relationship
                )}
                inputId="death-relationship-upload"
                buttonText="Upload file"
                error={
                  this.fieldError === 'relationshipDocuments'
                    ? this.errorMessageFor('relationshipDocuments')
                    : null
                }
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
              error={
                this.fieldError === 'identityDocumentType'
                  ? this.errorMessageFor('identityDocumentType')
                  : null
              }
              onChange={this.handleIdentityDocumentTypeChange}
            />
            {identityDoc && identityOption && (
              <INFO_NOTICE_BANNER>
                <strong>
                  {requiredDocumentHeading(
                    optionRequiresMultipleFiles(identityOption)
                  )}
                </strong>{' '}
                {identityDoc}
              </INFO_NOTICE_BANNER>
            )}
            {identityIsOther && (
              <INFO_NOTICE_BANNER>
                <p css={REQUIRED_DOC_INTRO_STYLING}>
                  <strong>{requiredDocumentHeading(true)}</strong>{' '}
                  {DEATH_IDENTITY_OTHER_REQUIRED_INTRO}
                </p>
                <ul css={ALTERNATE_LIST_STYLING}>
                  {DEATH_IDENTITY_ALTERNATE_LABELS.map(label => (
                    <li key={label}>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </INFO_NOTICE_BANNER>
            )}
          </div>

          {this.identityDocumentType &&
            !identityIsOther && (
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
                  acceptTypes={ACCEPT_TYPES}
                  attachmentLabel={deathIdentityAttachmentLabel(
                    this.identityDocumentType
                  )}
                  inputId="death-identity-upload"
                  buttonText="Upload file"
                  error={
                    this.fieldError === 'identityDocuments'
                      ? this.errorMessageFor('identityDocuments')
                      : null
                  }
                />
              </div>
            )}

          {identityIsOther && this.renderOtherIdentityUploads()}
        </div>
      </div>
    );
  }

  private renderOtherIdentityUploads() {
    const firstOption =
      this.identityAlternateDocumentType1 &&
      DEATH_IDENTITY_ALTERNATE_OPTIONS[this.identityAlternateDocumentType1]
        ? DEATH_IDENTITY_ALTERNATE_OPTIONS[this.identityAlternateDocumentType1]
        : null;
    const firstRequired = firstOption ? firstOption.requiredDocument : null;
    const secondOption =
      this.identityAlternateDocumentType2 &&
      DEATH_IDENTITY_ALTERNATE_OPTIONS[this.identityAlternateDocumentType2]
        ? DEATH_IDENTITY_ALTERNATE_OPTIONS[this.identityAlternateDocumentType2]
        : null;
    const secondRequired = secondOption ? secondOption.requiredDocument : null;

    return (
      <div css={OTHER_IDENTITY_STYLING}>
        <div css={FIELD_BLOCK_STYLING}>
          <DeathSelectField
            label="First Proof of Identity"
            name="identityAlternateDocumentType1"
            required
            blankLabel="First document type"
            options={IDENTITY_ALTERNATE_OPTIONS}
            value={this.identityAlternateDocumentType1}
            error={
              this.fieldError === 'identityAlternateDocumentType1'
                ? this.errorMessageFor('identityAlternateDocumentType1')
                : null
            }
            onChange={this.handleIdentityAlternateType1Change}
          />
          {firstRequired && firstOption && (
            <div css={FIELD_BLOCK_STYLING}>
              <INFO_NOTICE_BANNER>
                <strong>
                  {requiredDocumentHeading(
                    optionRequiresMultipleFiles(firstOption)
                  )}
                </strong>{' '}
                {firstRequired}
              </INFO_NOTICE_BANNER>
              <div css={UPLOAD_LABEL_STYLING}>
                Upload your first proof of identity{' '}
                <span className="t--req">Required</span>
              </div>
              <DeathDocumentsUpload
                certificateType="death"
                uploadSessionId={this.uploadSessionId}
                selectedFiles={this.identityDocuments}
                handleInputChange={this.handleIdentityDocumentsChange}
                acceptTypes={ACCEPT_TYPES}
                attachmentLabel={deathIdentityAttachmentLabel(
                  this.identityAlternateDocumentType1
                )}
                inputId="death-identity-upload-1"
                buttonText="Upload file"
                error={
                  this.fieldError === 'identityDocuments'
                    ? this.errorMessageFor('identityDocuments')
                    : null
                }
              />
            </div>
          )}
        </div>

        <div css={FIELD_BLOCK_STYLING}>
          <DeathSelectField
            label="Second Proof of Identity"
            name="identityAlternateDocumentType2"
            required
            blankLabel="Second document type"
            options={IDENTITY_ALTERNATE_OPTIONS}
            value={this.identityAlternateDocumentType2}
            error={
              this.fieldError === 'identityAlternateDocumentType2'
                ? this.errorMessageFor('identityAlternateDocumentType2')
                : null
            }
            onChange={this.handleIdentityAlternateType2Change}
          />
          {secondRequired && secondOption && (
            <div css={FIELD_BLOCK_STYLING}>
              <INFO_NOTICE_BANNER>
                <strong>
                  {requiredDocumentHeading(
                    optionRequiresMultipleFiles(secondOption)
                  )}
                </strong>{' '}
                {secondRequired}
              </INFO_NOTICE_BANNER>
              <div css={UPLOAD_LABEL_STYLING}>
                Upload your second proof of identity{' '}
                <span className="t--req">Required</span>
              </div>
              <DeathDocumentsUpload
                certificateType="death"
                uploadSessionId={this.uploadSessionId}
                selectedFiles={this.identityDocumentsSecondary}
                handleInputChange={this.handleIdentityDocumentsSecondaryChange}
                acceptTypes={ACCEPT_TYPES}
                attachmentLabel={deathIdentityAttachmentLabel(
                  this.identityAlternateDocumentType2
                )}
                inputId="death-identity-upload-2"
                buttonText="Upload file"
                error={
                  this.fieldError === 'identityDocumentsSecondary'
                    ? this.errorMessageFor('identityDocumentsSecondary')
                    : null
                }
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

const PROGRESS_WRAP_STYLING = css({
  marginBottom: '2rem',
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
  color: '#000000',
  p: {
    margin: '0 0 1rem',
    color: '#000000',
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

const FIELDSET_ERROR_STYLING = css({
  outline: `2px solid ${ERROR_BORDER_COLOR}`,
  outlineOffset: '4px',
});

const QUESTION_LEGEND_STYLING = css({
  fontFamily: SERIF,
  fontSize: '1.125rem',
  fontWeight: 700,
  color: CHARLES_BLUE,
  marginBottom: '1rem',
  padding: 0,
});

const SELECTION_NOTE_STYLING = css({
  color: '#091F2F',
  fontFamily: SANS,
  fontSize: '24px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '0.8',
  fontVariant: 'all-small-caps',
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

const REQUIRED_DOC_INTRO_STYLING = css({
  margin: 0,
});

const ALTERNATE_LIST_STYLING = css({
  // Boston.gov base CSS often resets list markers — draw bullets ourselves.
  margin: '0.5rem 0 0.75rem',
  paddingLeft: 0,
  listStyle: 'none',
  li: {
    position: 'relative',
    margin: '0 0 0.35rem',
    paddingLeft: '1.25rem',
    '&::before': {
      content: '"•"',
      position: 'absolute',
      left: 0,
      color: CHARLES_BLUE,
    },
  },
});

const OTHER_IDENTITY_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
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

  '&:focus': {
    outline: 'none',
  },

  '&:focus-visible': {
    outline: `3px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '2px',
  },
});

const PRIMARY_BUTTON_STYLING = css({
  minHeight: '55px',
  minWidth: '10rem',
  textTransform: 'uppercase',
  fontWeight: 700,

  '&:focus': {
    outline: 'none',
  },

  '&:focus-visible': {
    outline: `3px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '2px',
  },
});
