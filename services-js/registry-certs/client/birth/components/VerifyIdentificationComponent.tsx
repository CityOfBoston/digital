import React from 'react';
import { observer } from 'mobx-react';

import { css } from 'emotion';

import {
  UploadPhoto,
  BLACK,
  OPTIMISTIC_BLUE_LIGHT,
  ContactForm,
} from '@cityofboston/react-fleet';

import FieldsetComponent from '../components/FieldsetComponent';
import SupportingDocumentsInput from './SupportingDocumentsInput';
import IdIcon from '../icons/IdIcon';

import UploadableFile from '../../models/UploadableFile';

import { SECTION_HEADING_STYLING, SUPPORTING_TEXT_STYLING } from '../styling';

/** Images that are likely output from scanners or phone cameras */
const SUPPORTED_MIME_TYPES =
  'image/jpeg,image/png,image/tiff,image/bmp,application/pdf';

interface Props {
  sectionsToDisplay?: 'all' | 'supportingDocumentsOnly';
  uploadSessionId: string;
  gaSendEvent: (label: string) => void;

  supportingDocuments: UploadableFile[];
  updateSupportingDocuments: (documents: UploadableFile[]) => void;

  idImageBack?: UploadableFile | null;
  idImageFront?: UploadableFile | null;
  updateIdImages: (side: string, image: any) => void;
}

/**
 * Component which allows a user to upload images and supporting files for
 * identification verification. User will also have the ability to take photos
 * with their current device, if possible.
 */

@observer
export default class VerifyIdentificationComponent extends React.Component<
  Props
> {
  private handleSupportingDocumentsChange = (
    documents: UploadableFile[]
  ): void => {
    this.props.updateSupportingDocuments(documents);
  };

  private handleIdImageChange = (side: string, image: File | null): void => {
    this.props.updateIdImages(side, image);
  };

  private handleSendEventClick(label: string): void {
    this.props.gaSendEvent(label);
  }

  render() {
    if (this.props.sectionsToDisplay === 'supportingDocumentsOnly') {
      return this.renderSupportingDocumentsOnly();
    } else {
      return this.renderAll();
    }
  }

  private renderAll() {
    const { idImageBack, idImageFront } = this.props;

    return (
      <>
        <h2 className={SECTION_HEADING_STYLING}>Verify your identity</h2>

        <p className={SUPPORTING_TEXT_STYLING}>
          Under state law, the record you’re ordering may have an access
          restriction. You must upload a valid form of identification before we
          can process your request.
        </p>

        <p className={SUPPORTING_TEXT_STYLING}>
          <em>Please note</em>: You must be a person or parent listed on the
          record to get a copy of the record. If you are not listed on the
          record, you will not be able to get a copy. We will cancel your
          request and will not charge your card. Contact{' '}
          <a
            href="mailto:birth@boston.gov"
            onClick={ContactForm.makeMailtoClickHandler(
              'birth-cert-feedback-form'
            )}
          >
            birth@boston.gov
          </a>{' '}
          with questions.
        </p>

        <h3
          className={`${SECTION_HEADING_STYLING} secondary m-t700`}
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
          <div
            className="g--6 m-v500"
            onClick={() => this.handleSendEventClick('upload front of ID')}
          >
            <UploadPhoto
              initialFile={idImageFront ? idImageFront.file : null}
              uploadProgress={idImageFront && idImageFront.progress}
              errorMessage={idImageFront && idImageFront.errorMessage}
              handleDrop={file => this.handleIdImageChange('front', file)}
              handleRemove={() => this.handleIdImageChange('front', null)}
              backgroundElement={<IdImage name="front" />}
              buttonTitleUpload="Upload front of ID"
              acceptTypes={SUPPORTED_MIME_TYPES}
            />
          </div>

          <div className="g--6 m-v500">
            <UploadPhoto
              initialFile={idImageBack ? idImageBack.file : null}
              uploadProgress={idImageBack && idImageBack.progress}
              errorMessage={idImageBack && idImageBack.errorMessage}
              handleDrop={file => this.handleIdImageChange('back', file)}
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
              className={`${SECTION_HEADING_STYLING} secondary m-t700`}
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

        <h2 className={`${SECTION_HEADING_STYLING} secondary m-t700`}>
          No ID?
        </h2>

        <p className={`${SUPPORTING_TEXT_STYLING} m-b700`}>
          We can help explain your options.{' '}
          <a
            href={`mailto:birth@boston.gov?subject=${encodeURIComponent(
              'Birth Certificate Support Request: No ID'
            )}`}
            onClick={ContactForm.makeMailtoClickHandler(
              'birth-cert-no-id-form'
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
    return (
      <>
        <h2 className={SECTION_HEADING_STYLING}>Upload supporting documents</h2>

        <p>
          We need more information. If you have questions, contact{' '}
          <a href="mailto:birth@boston.gov">birth@boston.gov</a>.
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
      />
    );
  }
}

function IdImage(props: { name: string }): JSX.Element {
  return (
    <div className={`${PREVIEW_IMAGE_STYLING} id`}>
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
