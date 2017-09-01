// @flow

import React from 'react';
import { css } from 'glamor';
import { action, extras } from 'mobx';
import { observer } from 'mobx-react';
import Dropzone from 'react-dropzone';

import SectionHeader from '../../common/SectionHeader';
import { MEDIA_LARGE } from '../../style-constants';
import AttributeField from './AttributeField';

import CloudinaryImageUpload from '../../../data/external/CloudinaryImageUpload';

import type { AppStore } from '../../../data/store';
import type RequestForm from '../../../data/store/RequestForm';

export type Props = {|
  store: AppStore,
  requestForm: RequestForm,
  serviceName: string,
  serviceDescription: ?string,
  nextFunc: () => mixed,
  nextIsSubmit: boolean,
|};

const DROPZONE_STYLE = css({
  width: '100%',
  border: 'none',
  position: 'relative',
});

const DRAG_RING_STYLE = css({
  borderStyle: 'dashed',
  borderColor: 'white',
  position: 'absolute',
  top: '1rem',
  left: '1rem',
  bottom: '1rem',
  right: '1rem',
});

const BOTTOM_ROW_STYLE = css({
  alignItems: 'center',
});

const RIGHT_ON_LARGE_STYLE = css({
  [MEDIA_LARGE]: {
    textAlign: 'right',
  },
});

const PROGRESS_STYLE = css({
  position: 'absolute',
  left: 0,
  bottom: 0,
  height: 6,
  backgroundColor: '#288be4',
});

@observer
export default class QuestionsPane extends React.Component<Props> {
  imageUploader: CloudinaryImageUpload = new CloudinaryImageUpload();
  dropEl: ?Dropzone;

  @action
  componentWillMount() {
    const { store, requestForm } = this.props;
    this.imageUploader.config = store.apiKeys.cloudinary;
    this.imageUploader.adoptedUrlObservable = extras.getAtom(
      requestForm,
      'mediaUrl'
    );
  }

  @action
  componentWillReceiveProps(newProps: Props) {
    const { store, requestForm } = newProps;
    this.imageUploader.config = store.apiKeys.cloudinary;
    this.imageUploader.adoptedUrlObservable = extras.getAtom(
      requestForm,
      'mediaUrl'
    );
  }

  @action
  componentWillUnmount() {
    this.imageUploader.adoptedUrlObservable = null;
  }

  @action.bound
  handleDrop(acceptedFiles: File[]) {
    if (acceptedFiles[0]) {
      this.imageUploader.upload(acceptedFiles[0]);
    }
  }

  @action.bound
  handleUploadPhoto() {
    if (this.dropEl) {
      this.dropEl.open();
    }
  }

  @action.bound
  handleRemoveImage() {
    this.imageUploader.remove();
  }

  @action.bound
  handleUpdateDescription(ev: SyntheticInputEvent<>) {
    const { requestForm } = this.props;
    requestForm.description = ev.target.value;
  }

  @action.bound
  handleSubmit(ev: SyntheticInputEvent<>) {
    const { nextFunc } = this.props;

    ev.preventDefault();

    nextFunc();
  }

  setDropEl = (dropEl: ?Dropzone) => {
    this.dropEl = dropEl;
  };

  render() {
    const {
      requestForm,
      serviceName,
      serviceDescription,
      nextIsSubmit,
    } = this.props;
    const { description, questions, questionRequirementsMet } = requestForm;

    const questionsEls = [];
    questions.forEach((q, i) => {
      if (!q.visible) {
        return;
      }

      questionsEls.push(
        <div key={q.code}>
          <AttributeField question={q} />
        </div>
      );

      if (i < questions.length - 1) {
        questionsEls.push(
          <hr className="hr hr--dash m-v500" aria-hidden key={`${q.code}-HR`} />
        );
      }
    });

    return (
      <form onSubmit={this.handleSubmit}>
        <SectionHeader>
          {serviceName}
        </SectionHeader>

        <div className="t--intro m-v300">
          {serviceDescription}
        </div>

        <div className="g g--top">
          <div className="g--7 m-v500">
            <div className="txt">
              <label
                className="txt-l"
                htmlFor="QuestionsPane-description"
                style={{ marginTop: 0 }}
              >
                Description
              </label>
              <textarea
                name="description"
                id="QuestionsPane-description"
                className="txt-f"
                value={description}
                placeholder="Please describe your request"
                onChange={this.handleUpdateDescription}
                rows="5"
              />
            </div>

            {questionsEls}
          </div>

          {this.renderImageUpload()}
        </div>

        <div className={`g m-v500 ${BOTTOM_ROW_STYLE.toString()}`}>
          <div
            className={`g--9 t--info m-v200 ${RIGHT_ON_LARGE_STYLE.toString()}`}
          >
            {!questionRequirementsMet &&
              <span>
                Please fill out <span className="t--req">required</span> fields
                to continue
              </span>}
          </div>
          <button
            className="btn g--3"
            type="submit"
            disabled={!questionRequirementsMet}
          >
            {nextIsSubmit ? 'Submit Request' : 'Next'}
          </button>
        </div>
      </form>
    );
  }

  renderImageUpload() {
    const {
      errorMessage,
      displayUrl,
      uploading,
      uploadingProgress,
      canRemove,
    } = this.imageUploader;

    let buttonAction = null;
    let buttonTitle = null;
    let buttonClasses = 'btn btn--w btn--b';

    if (uploading) {
      buttonAction = this.handleRemoveImage;
      buttonTitle = 'Cancel Upload';
      buttonClasses = `${buttonClasses} btn--r-hov`;
    } else if (canRemove) {
      buttonAction = this.handleRemoveImage;
      buttonTitle = 'Remove Photo';
    } else {
      buttonAction = this.handleUploadPhoto;
      buttonTitle = 'Upload Photo';
    }

    return (
      <div className="g--5 m-v500">
        <div className="br br-a200">
          <Dropzone
            className={DROPZONE_STYLE.toString()}
            ref={this.setDropEl}
            onDrop={this.handleDrop}
            multiple={false}
            accept="image/*"
          >
            {({ isDragActive }) => {
              const out = [
                displayUrl
                  ? <img
                      key="img"
                      style={{ display: 'block', width: '100%' }}
                      alt=""
                      aria-hidden
                      src={displayUrl}
                    />
                  : <img
                      key="img"
                      style={{
                        display: 'block',
                        width: '100%',
                        height: 'auto',
                      }}
                      aria-hidden
                      alt=""
                      width="479"
                      height="324"
                      src="/assets/img/image-upload.png"
                    />,
              ];

              if (isDragActive) {
                out.push(
                  <div
                    key="ring"
                    className={`br-a300 ${DRAG_RING_STYLE.toString()}`}
                  />
                );
              }

              return out;
            }}
          </Dropzone>

          {errorMessage &&
            <div className="t--info br br-t200 p-a300">
              {errorMessage}
            </div>}

          <div className="br br-t200" style={{ position: 'relative' }}>
            <button
              className={buttonClasses}
              style={{
                visibility: buttonAction ? 'visible' : 'hidden',
                width: '100%',
              }}
              type="button"
              onClick={buttonAction}
            >
              {buttonTitle}
            </button>
            {uploading &&
              <div
                className={PROGRESS_STYLE}
                style={{ width: `${100 * uploadingProgress}%` }}
              />}
          </div>
        </div>
      </div>
    );
  }
}
