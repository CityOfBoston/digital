// @flow

import React from 'react';
import { css } from 'glamor';
import { action, extras } from 'mobx';
import { observer } from 'mobx-react';
import Dropzone from 'react-dropzone';

import SectionHeader from '../../common/SectionHeader';
import DescriptionBox from '../../common/DescriptionBox';
import AttributeField from './AttributeField';

import CloudinaryImageUpload from '../../../data/external/CloudinaryImageUpload';

import type { AppStore } from '../../../data/store';

export type Props = {|
  store: AppStore,
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

const PROGRESS_STYLE = css({
  position: 'absolute',
  left: 0,
  bottom: 0,
  height: 6,
  backgroundColor: '#288be4',
});

@observer
export default class QuestionsPane extends React.Component {
  props: Props;

  imageUploader: CloudinaryImageUpload = new CloudinaryImageUpload();
  dropEl: ?Dropzone;

  @action
  componentWillMount() {
    const { store } = this.props;
    this.imageUploader.config = store.apiKeys.cloudinary;
    this.imageUploader.adoptedUrlObservable = extras.getAtom(store.requestForm, 'mediaUrl');
  }

  @action
  componentWillReceiveProps(newProps: Props) {
    const { store } = newProps;
    this.imageUploader.config = store.apiKeys.cloudinary;
    this.imageUploader.adoptedUrlObservable = extras.getAtom(store.requestForm, 'mediaUrl');
  }

  @action
  componnetWillUnmount() {
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
  handleUpdateDescription(ev: SyntheticInputEvent) {
    const { store } = this.props;
    store.requestForm.description = ev.target.value;
  }

  setDropEl = (dropEl: ?Dropzone) => {
    this.dropEl = dropEl;
  }

  render() {
    const { store, nextFunc, nextIsSubmit } = this.props;
    const { currentService, requestForm: { description, questions, questionRequirementsMet } } = store;

    const questionsEls = [];
    questions.forEach((q, i) => {
      if (!q.visible) {
        return;
      }

      questionsEls.push(<div key={q.code}><AttributeField question={q} /></div>);

      if (i < questions.length - 1) {
        questionsEls.push(<hr className="hr hr--dash m-v500" key={`${q.code}-HR`} />);
      }
    });

    return (
      <div>
        <SectionHeader>{ currentService ? currentService.name : '' }</SectionHeader>

        <div className="g g--top">
          <div className="g--7 m-v500">
            <DescriptionBox
              text={description}
              placeholder="How can we help?"
              onInput={this.handleUpdateDescription}
              minHeight={100}
              maxHeight={360}
            />

            { questionsEls }
          </div>

          { this.renderImageUpload() }
        </div>

        <div className={`g m-v500 ${BOTTOM_ROW_STYLE.toString()}`}>
          <div className="g--9 t--info" style={{ textAlign: 'right' }}>
            {!questionRequirementsMet && <span>Please fill out <span className="t--req">required</span> fields to continue</span>}
          </div>
          <button className="btn g--3" onClick={nextFunc} disabled={!questionRequirementsMet}>{nextIsSubmit ? 'Submit Request' : 'Next'}</button>
        </div>
      </div>
    );
  }

  renderImageUpload() {
    const { errorMessage, displayUrl, uploading, uploadingProgress, canRemove } = this.imageUploader;

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
          <Dropzone className={DROPZONE_STYLE.toString()} ref={this.setDropEl} onDrop={this.handleDrop} multiple={false} accept="image/*">
            {({ isDragActive }) => {
              const out = [
                displayUrl ?
                  <img key="img" style={{ display: 'block', width: '100%' }} alt="" src={displayUrl} /> :
                  <img key="img" style={{ display: 'block', width: '100%', height: 'auto' }} alt="" width="479" height="324" src="/static/img/image-upload.png" />,
              ];

              if (isDragActive) {
                out.push(<div key="ring" className={`br-a300 ${DRAG_RING_STYLE.toString()}`} />);
              }

              return out;
            }}
          </Dropzone>

          { errorMessage && <div className="t--info br br-t200 p-a300">{errorMessage}</div> }

          <div className="br br-t200" style={{ position: 'relative' }}>
            <a href="javascript:void(0)" className={buttonClasses} style={{ visibility: buttonAction ? 'visible' : 'hidden' }} onClick={buttonAction}>{buttonTitle}</a>
            { uploading && <div className={PROGRESS_STYLE} style={{ width: `${100 * uploadingProgress}%` }} />}
          </div>
        </div>
      </div>

    );
  }
}
