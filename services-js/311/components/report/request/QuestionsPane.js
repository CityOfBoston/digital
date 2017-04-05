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

export type Props = {
  store: AppStore,
  nextFunc: () => void,
};

const DROPZONE_STYLE = css({
  width: '100%',
  border: 'none',
});

@observer
export default class QuestionsPane extends React.Component {
  props: Props;

  imageUploader: CloudinaryImageUpload = new CloudinaryImageUpload();

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
  handleRemoveImage() {
    this.imageUploader.remove();
  }

  @action.bound
  handleUpdateDescription(ev: SyntheticInputEvent) {
    const { store } = this.props;
    store.requestForm.description = ev.target.value;
  }

  render() {
    const { store, nextFunc } = this.props;
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

        <div className="m-v500">
          <div className="g">
            <div className="g--9" />
            <button className="btn g--33" onClick={nextFunc} disabled={!questionRequirementsMet}>Next</button>
          </div>
        </div>
      </div>
    );
  }

  renderImageUpload() {
    const { errorMessage, displayUrl, uploading, uploadingProgress, canRemove } = this.imageUploader;

    return (
      <div className="g--5 m-v500">
        <Dropzone className={DROPZONE_STYLE.toString()} onDrop={this.handleDrop} multiple={false} accept="image/*">
          { displayUrl ?
            <img style={{ display: 'block', width: '100%' }} alt="" src={displayUrl} /> :
            <img style={{ display: 'block', width: '100%', height: 'auto' }} alt="" width="479" height="324" src="/static/img/311-watermark.svg" />
          }
        </Dropzone>

        { uploading && <progress value={uploadingProgress} max="1" style={{ width: '100%' }} />}
        { errorMessage && <div className="t--info">{errorMessage}</div> }
        { canRemove && <a href="javascript:void(0)" onClick={this.handleRemoveImage}>Remove</a> }
      </div>

    );
  }
}
