// @flow

import React from 'react';
import { css } from 'glamor';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Dropzone from 'react-dropzone';

import SectionHeader from '../../common/SectionHeader';
import DescriptionBox from '../../common/DescriptionBox';
import AttributeField from './AttributeField';

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

  @action.bound
  handleDrop(acceptedFiles: File[]) {
    const { store } = this.props;
    store.requestMediaUploader.file = acceptedFiles[0];
  }

  @action.bound
  handleRemoveImage() {
    const { store } = this.props;
    store.requestMediaUploader.file = null;
  }

  @action.bound
  handleUpdateDescription(ev: SyntheticInputEvent) {
    const { store } = this.props;
    store.description = ev.target.value;
  }

  render() {
    const { store, nextFunc } = this.props;
    const { currentService, description, questions, questionRequirementsMet } = store;

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

        <div className="m-v500">
          <div className="g g--top">
            <div className="g--7">
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
        </div>


        <div className="g">
          <div className="g--9" />
          <button className="btn g--33" onClick={nextFunc} disabled={!questionRequirementsMet}>Next</button>
        </div>
      </div>
    );
  }

  renderImageUpload() {
    const { store } = this.props;
    const { errorMessage, loaded, previewUrl, uploading, uploadingProgress } = store.requestMediaUploader;

    return (
      <div className="g--5">
        <Dropzone className={DROPZONE_STYLE.toString()} onDrop={this.handleDrop} multiple={false} accept="image/*">
          { previewUrl ?
            <img style={{ display: 'block', width: '100%' }} alt="" src={previewUrl} /> :
            <img style={{ display: 'block', width: '100%', height: 'auto' }} alt="" width="479" height="324" src="/static/img/311-watermark.svg" />
          }
        </Dropzone>

        { uploading && <progress value={uploadingProgress} max="1" style={{ width: '100%' }} />}
        { errorMessage && <div className="t--info">{errorMessage}</div> }
        { loaded && <a href="javascript:void(0)" onClick={this.handleRemoveImage}>Remove</a> }
      </div>

    );
  }
}
