// @flow

import React from 'react';
import { action, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'glamor';
import debounce from 'lodash/debounce';

import type { ServiceSummary } from '../../../data/types';
import type { AppStore } from '../../../data/store';
import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import loadServiceSuggestions from '../../../data/dao/load-service-suggestions';

import FormDialog from '../../common/FormDialog';
import { HEADER_HEIGHT, MEDIA_LARGE, CENTERED_DIALOG_STYLE } from '../../style-constants';

import HomePane from './HomePane';
import ChooseServicePane from './ChooseServicePane';

import RecentRequestsHeader from './RecentRequestsHeader';
import RecentRequests from './RecentRequests';

export type Props = {|
  store: AppStore,
  stage: 'home' | 'choose',
  loopbackGraphql: LoopbackGraphql,
|};

const SCREENFULL_CONTAINER = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'relative',
  zIndex: 1,
  [MEDIA_LARGE]: {
    minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  },
});

@observer
export default class HomeDialog extends React.Component {
  props: Props;

  @observable.shallow suggestedServiceSummaries: ?ServiceSummary[] = null;
  serviceSuggestionsDisposer: ?Function

  componentDidMount() {
    this.serviceSuggestionsDisposer = reaction(
      () => this.props.store.requestForm.description,
      (description: string) => {
        if (description === '') {
          this.suggestedServiceSummaries = [];
        } else {
          this.suggestedServiceSummaries = null;
          this.suggestServices(description);
        }
      },
      {
        fireImmediately: true,
        name: 'update service suggestions from description',
      },
    );

    const { store, loopbackGraphql } = this.props;
    store.requestSearch.start(loopbackGraphql);
  }

  componentWillUnmount() {
    if (this.serviceSuggestionsDisposer) {
      this.serviceSuggestionsDisposer();
    }

    const { store } = this.props;
    store.requestSearch.stop();
  }

  suggestServices = debounce(async (description: string) => {
    try {
      const suggestedServiceSummaries = await loadServiceSuggestions(this.props.loopbackGraphql, description);

      runInAction('suggestServices result', () => {
        this.suggestedServiceSummaries = suggestedServiceSummaries;
      });
    } catch (e) {
      runInAction('suggestServices error', () => {
        this.suggestedServiceSummaries = [];
      });
      throw e;
    }
  }, 500)

  @action.bound
  handleDescriptionChanged(ev: SyntheticInputEvent) {
    const { store } = this.props;

    store.requestForm.description = ev.target.value;
  }

  render() {
    const { stage, store } = this.props;
    const { mediaLarge } = store.ui;

    const narrow = (stage === 'choose');
    const noPadding = (stage === 'choose');

    return (
      <div>
        <div className={SCREENFULL_CONTAINER}>
          <div className={CENTERED_DIALOG_STYLE}>
            <FormDialog narrow={narrow} noPadding={noPadding}>
              { stage === 'home' && this.renderHome() }
              { stage === 'choose' && this.renderServicePicker() }
            </FormDialog>
          </div>

          { mediaLarge && stage === 'home' && <RecentRequestsHeader store={store} />}
        </div>

        { mediaLarge && stage === 'home' && (
          <RecentRequests store={store} />
        )}
      </div>
    );
  }

  renderHome() {
    const { store } = this.props;
    return (
      <HomePane description={store.requestForm.description} handleDescriptionChanged={this.handleDescriptionChanged} topServiceSummaries={store.topServiceSummaries} />
    );
  }

  renderServicePicker() {
    const { store } = this.props;
    return (
      <ChooseServicePane description={store.requestForm.description} handleDescriptionChanged={this.handleDescriptionChanged} suggestedServiceSummaries={this.suggestedServiceSummaries} />
    );
  }
}
