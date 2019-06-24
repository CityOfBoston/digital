/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { Component } from 'react';

import { observer } from 'mobx-react';

import {
  UploadPhoto,
  BLACK,
  OPTIMISTIC_BLUE_LIGHT,
  ContactForm,
} from '@cityofboston/react-fleet';

import { capitalize } from '../../../lib/helpers';

import { CertificateType } from '../../types';
import UploadableFile from '../../models/UploadableFile';

import FieldsetComponent from './FieldsetComponent';
import SupportingDocumentsInput from '../SupportingDocumentsInput';
import IdIcon from '../icons/IdIcon';

import { SECTION_HEADING_STYLING, SUPPORTING_TEXT_CLASSNAME } from './styling';

// Images that are likely output from scanners or phone cameras
const SUPPORTED_MIME_TYPES =
  'image/jpeg,image/png,image/tiff,image/bmp,application/pdf';

type Side = 'front' | 'back';

interface Props {
  siteAnalytics?: any;
  sectionsToDisplay?: 'all' | 'supportingDocumentsOnly';
  uploadSessionId: string;
  certificateType: CertificateType;

  supportingDocuments: UploadableFile[];
  updateSupportingDocuments: (documents: UploadableFile[]) => void;

  idImageBack?: UploadableFile | null;
  idImageFront?: UploadableFile | null;
  updateIdImages: (side: Side, image: any) => void;
}

/**
 * Component which allows a user to upload images and supporting files for
 * identification verification. User will also have the ability to take photos
 * with their current device, if possible.
 */
@observer
export default class VerifyIdentificationComponent extends Component<Props> {
  private handleSupportingDocumentsChange = (
    documents: UploadableFile[]
  ): void => {
    this.props.updateSupportingDocuments(documents);
  };

  private handleIdImageChange = (side: Side, image: File | null): void => {
    this.props.updateIdImages(side, image);
  };

  private handlePhotoButtonClick = (side: Side): void => {
    let labelText = 'click to ';

    if (side === 'front') {
      if (this.props.idImageFront) {
        labelText += 'remove';
      } else {
        labelText += 'add';
      }
    } else {
      if (this.props.idImageBack) {
        labelText += 'remove';
      } else {
        labelText += 'add';
      }
    }

    if (this.props.certificateType === 'birth') {
      this.props.siteAnalytics.sendEvent(`photo ID ${side}`, {
        category: 'Birth',
        label: labelText,
      });
    }
  };

  private handlePhotoDrop = (side: Side, image: File | null): void => {
    if (this.props.certificateType === 'birth') {
      this.props.siteAnalytics.sendEvent(`photo ID ${side}`, {
        category: 'Birth',
        label: 'drop to add',
      });
    }

    this.handleIdImageChange(side, image);
  };

  private handleSendEventClick = (label: string): void => {
    if (this.props.certificateType === 'birth') {
      this.props.siteAnalytics.sendEvent('click', {
        category: 'Birth',
        label,
      });
    }
  };

  render() {
    if (this.props.sectionsToDisplay === 'supportingDocumentsOnly') {
      return this.renderSupportingDocumentsOnly();
    } else {
      return this.renderAll();
    }
  }

  private renderAll() {
    const { certificateType, idImageBack, idImageFront } = this.props;
    const emailName =
      certificateType === 'birth' ? certificateType : 'registry';

    return (
      <>
        <h2 css={SECTION_HEADING_STYLING}>Verify your identity</h2>

        <p className={SUPPORTING_TEXT_CLASSNAME}>
          Under state law, the record you’re ordering may have an access
          restriction. You must upload a valid form of identification before we
          can process your request.
        </p>

        <p className={SUPPORTING_TEXT_CLASSNAME}>
          <em>Please note</em>: You must be{' '}
          {certificateType === 'birth' && 'a person or parent'} listed on the
          record to get a copy of the certificate. If you are not listed on the
          record, you will not be able to get a copy. We will cancel your
          request and will not charge your card. Contact{' '}
          <a
            href={`mailto:${emailName}@boston.gov`}
            onClick={ContactForm.makeMailtoClickHandler(
              `${certificateType}-cert-feedback-form`
            )}
          >
            {emailName}@boston.gov
          </a>{' '}
          with questions.
        </p>

        <h3
          className="secondary m-t700"
          css={SECTION_HEADING_STYLING}
          style={{ borderBottom: 0 }}
        >
          Upload ID images
        </h3>

        <h3>We accept the following forms of ID:</h3>
        <ul className="lh--300">
          <li>Driver’s License</li>
          <li>State ID</li>
          <li>Passport</li>
          <li>Military ID</li>
        </ul>

        <div className="g">
          <div className="g--6 m-v500">
            <UploadPhoto
              initialFile={idImageFront ? idImageFront.file || true : null}
              uploadProgress={idImageFront && idImageFront.progress}
              errorMessage={idImageFront && idImageFront.errorMessage}
              handleButtonClick={() => this.handlePhotoButtonClick('front')}
              handleDrop={file => this.handlePhotoDrop('front', file)}
              handleRemove={() => this.handleIdImageChange('front', null)}
              backgroundElement={<IdImage name="front" />}
              buttonTitleUpload="Upload front of ID"
              acceptTypes={SUPPORTED_MIME_TYPES}
            />
          </div>

          <div className="g--6 m-v500">
            <UploadPhoto
              initialFile={idImageBack ? idImageBack.file || true : null}
              uploadProgress={idImageBack && idImageBack.progress}
              errorMessage={idImageBack && idImageBack.errorMessage}
              handleButtonClick={() => this.handlePhotoButtonClick('back')}
              handleDrop={file => this.handlePhotoDrop('back', file)}
              handleRemove={() => this.handleIdImageChange('back', null)}
              backgroundElement={<IdImage name="back" />}
              buttonTitleUpload="Upload back of ID"
              acceptTypes={SUPPORTED_MIME_TYPES}
            />
          </div>
        </div>

        <FieldsetComponent
          legendText={
            <h3
              className="secondary m-t700"
              css={SECTION_HEADING_STYLING}
              style={{ borderBottom: 0 }}
            >
              Have you had a legal name change or do you have court
              guardianship?
            </h3>
          }
        >
          <div
            onClick={() =>
              this.handleSendEventClick('upload supporting documents')
            }
          >
            {this.renderSupportingDocumentsInput()}
          </div>
        </FieldsetComponent>

        <h2 className="secondary m-t700" css={SECTION_HEADING_STYLING}>
          No ID?
        </h2>

        <p className={`m-b700 ${SUPPORTING_TEXT_CLASSNAME}`}>
          We can help explain your options.{' '}
          <a
            href={`mailto:${emailName}@boston.gov?subject=${encodeURIComponent(
              `${capitalize(
                certificateType
              )} Certificate Support Request: No ID`
            )}`}
            onClick={ContactForm.makeMailtoClickHandler(
              `${certificateType}-cert-no-id-form`
            )}
            onMouseUp={() => this.handleSendEventClick('no id; requested help')}
          >
            Request help <span aria-hidden="true">→</span>
          </a>
        </p>
      </>
    );
  }

  private renderSupportingDocumentsOnly() {
    const { certificateType } = this.props;
    const emailName =
      certificateType === 'birth' ? certificateType : 'registry';

    return (
      <>
        <h2 css={SECTION_HEADING_STYLING}>Upload supporting documents</h2>

        <p>
          We need more information. If you have questions, contact{' '}
          <a href={`mailto:${emailName}@boston.gov`}>{emailName}@boston.gov</a>.
        </p>

        {this.renderSupportingDocumentsInput()}
      </>
    );
  }

  private renderSupportingDocumentsInput() {
    return (
      <SupportingDocumentsInput
        uploadSessionId={this.props.uploadSessionId}
        selectedFiles={this.props.supportingDocuments}
        handleInputChange={this.handleSupportingDocumentsChange}
        acceptTypes={SUPPORTED_MIME_TYPES}
        certificateType={this.props.certificateType}
      />
    );
  }
}

function IdImage(props: { name: string }): JSX.Element {
  return (
    <div className="id" css={PREVIEW_IMAGE_STYLING}>
      <IdIcon side={props.name} />
    </div>
  );
}

const PREVIEW_IMAGE_STYLING = css({
  backgroundColor: OPTIMISTIC_BLUE_LIGHT,
  color: BLACK,

  '&.id': {
    padding: '2rem 4rem',
  },
});
