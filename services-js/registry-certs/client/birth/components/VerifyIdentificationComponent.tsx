import React from 'react';

import { css } from 'emotion';

import {
  Radio,
  UploadPhoto,
  BLACK,
  OPTIMISTIC_BLUE_LIGHT,
} from '@cityofboston/react-fleet';

import FieldsetComponent from './FieldsetComponent';
import SupportingDocumentsInput from './SupportingDocumentsInput';
import IdIcon from '../icons/IdIcon';

import { SECTION_HEADING_STYLING, SUPPORTING_TEXT_STYLING } from '../styling';

// todo: props to pass addt’l info in if Registry has initiated this
interface Props {
  updateSupportingDocuments: (documents: File[]) => void;
  updateIdImages: (side: string, image: any) => void;
  isComplete?: (status: boolean) => void;
}

interface State {
  requireSupportingDocuments: boolean;
  hasIdFront: boolean;
  hasIdBack: boolean;
  hasDocuments: boolean;
}

/**
 * Component which allows a user to upload images and supporting files for
 * identification verification. User will also have the ability to take photos
 * with their current device, if possible.
 */
export default class VerifyIdentificationComponent extends React.Component<
  Props,
  State
> {
  state: State = {
    requireSupportingDocuments: false,
    hasIdFront: false,
    hasIdBack: false,
    hasDocuments: false,
  };

  // User cannot proceed before submitting a front and back scan of their ID.
  // They must also submit supporting documents before proceeding, if those
  // are required.
  private checkIsComplete() {
    const idComplete = this.state.hasIdFront && this.state.hasIdBack;

    if (!this.props.isComplete) {
      return;
    }

    if (
      idComplete &&
      this.state.requireSupportingDocuments &&
      this.state.hasDocuments
    ) {
      this.props.isComplete(true);
    } else if (idComplete && !this.state.requireSupportingDocuments) {
      this.props.isComplete(true);
    } else {
      this.props.isComplete(false);
    }
  }

  handleSupportingDocumentsChange = (documents: File[]): void => {
    this.setState({ hasDocuments: !!documents.length });

    this.props.updateSupportingDocuments(documents);
  };

  handleIdImageChange = (side: string, image: File | null): void => {
    if (side === 'front') {
      this.setState({ hasIdFront: !!image });
    } else if (side === 'back') {
      this.setState({ hasIdBack: !!image });
    }

    this.props.updateIdImages(side, image);
  };

  handleBooleanChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      requireSupportingDocuments: event.target.value === 'yes',
    });
  };

  // Inform the parent whether or not all required information has been added
  // by the user, if necessary.
  componentDidUpdate(_prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (prevState !== this.state) {
      this.checkIsComplete();
    }
  }

  render() {
    return (
      <div>
        <h2 className={SECTION_HEADING_STYLING}>Verify your identity</h2>

        <p className={SUPPORTING_TEXT_STYLING}>
          Since the record you’re ordering may have an access restriction, you
          must upload a valid form of identification (i.e. driver’s license,
          state ID, military ID, or passport) before we can process your
          request.
        </p>
        <p>
          <em>Please note</em>: You must be a person or parent listed on the
          record in order to get a copy of the record. If you are not listed on
          the record, you will not be able to get a copy. Your request will be
          canceled and your card will not be charged. Contact{' '}
          <a href="mailto:birth@boston.gov">birth@boston.gov</a> with questions.
        </p>

        <h3>We accept the following forms of ID:</h3>
        <ul>
          <li>Driver’s License</li>
          <li>State ID</li>
          <li>Passport</li>
          <li>Military ID</li>
        </ul>

        <h3
          className={`${SECTION_HEADING_STYLING} secondary m-t700`}
          style={{ borderBottom: 0 }}
        >
          Upload ID images
        </h3>

        <div className="g">
          <div className="g--6 m-v500">
            <UploadPhoto
              uploadProgress={null}
              errorMessage={null}
              handleDrop={file => this.handleIdImageChange('front', file)}
              handleRemove={() => this.handleIdImageChange('front', null)}
              backgroundElement={<IdImage name="front" />}
              buttonTitleUpload="Upload front of ID"
            />
          </div>

          <div className="g--6 m-v500">
            <UploadPhoto
              uploadProgress={null}
              errorMessage={null}
              handleDrop={file => this.handleIdImageChange('back', file)}
              handleRemove={() => this.handleIdImageChange('back', null)}
              backgroundElement={<IdImage name="back" />}
              buttonTitleUpload="Upload back of ID"
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
          <Radio
            name="no"
            value="no"
            label="No"
            checked={!this.state.requireSupportingDocuments}
            onChange={this.handleBooleanChange}
          />
          <Radio
            name="yes"
            value="yes"
            label="Yes"
            checked={this.state.requireSupportingDocuments}
            onChange={this.handleBooleanChange}
          />

          {this.state.requireSupportingDocuments && (
            <SupportingDocumentsInput
              name="supporting"
              title="Upload supporting documents"
              fileTypes={['application/pdf']}
              sizeLimit={{ amount: 10, unit: 'MB' }}
              handleChange={this.handleSupportingDocumentsChange}
            />
          )}
        </FieldsetComponent>

        <h2 className={`${SECTION_HEADING_STYLING} secondary m-t700`}>
          No ID?
        </h2>

        <p className={`${SUPPORTING_TEXT_STYLING} m-b700`}>
          We can help explain your options.{' '}
          <a>
            Request help <span aria-hidden="true">→</span>
          </a>
        </p>
      </div>
    );
  }
}

function IdImage(props: { name: string }): JSX.Element {
  return (
    <div className={ID_IMAGE_STYLING}>
      <IdIcon side={props.name} />
    </div>
  );
}

const ID_IMAGE_STYLING = css({
  backgroundColor: OPTIMISTIC_BLUE_LIGHT,
  color: BLACK,

  padding: '2rem 4rem',
});
