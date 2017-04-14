// @flow

import React from 'react';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import sampleSize from 'lodash/sampleSize';

import type { ServiceSummary } from '../../../data/types';
import type { AppStore } from '../../../data/store';
import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import loadServiceSuggestions from '../../../data/dao/load-service-suggestions';

import FormDialog from '../../common/FormDialog';

import HomePane from './HomePane';
import ChooseServicePane from './ChooseServicePane';

export type Props = {
  store: AppStore,
  // eslint-disable-next-line react/no-unused-prop-types
  stage: 'home' | 'choose',
  loopbackGraphql: LoopbackGraphql,
};

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
  }

  componentWillUnmount() {
    if (this.serviceSuggestionsDisposer) {
      this.serviceSuggestionsDisposer();
    }
  }

  suggestServices = debounce(async (description: string) => {
    const suggestedServiceSummaries = await loadServiceSuggestions(this.props.loopbackGraphql, description);

    runInAction('suggestServices result', () => {
      this.suggestedServiceSummaries = suggestedServiceSummaries;
    });
  }, 500)

  @computed get topServiceSummaries(): ServiceSummary[] {
    const { store } = this.props;
    // random sample now until we get this built
    return sampleSize((store.serviceSummaries: any).peek(), 6);
  }

  @action.bound
  handleDescriptionChanged(ev: SyntheticInputEvent) {
    const { store } = this.props;

    store.requestForm.description = ev.target.value;
  }

  render() {
    const { stage } = this.props;
    switch (stage) {
      case 'home': return this.renderHome();
      case 'choose': return this.renderServicePicker();
      default: return null;
    }
  }

  renderHome() {
    const { store } = this.props;
    return (
      <FormDialog>
        <HomePane description={store.requestForm.description} handleDescriptionChanged={this.handleDescriptionChanged} topServiceSummaries={this.topServiceSummaries} />
      </FormDialog>
    );
  }

  renderServicePicker() {
    const { store } = this.props;
    return (
      <FormDialog narrow noPadding>
        <ChooseServicePane description={store.requestForm.description} handleDescriptionChanged={this.handleDescriptionChanged} suggestedServiceSummaries={this.suggestedServiceSummaries} />
      </FormDialog>
    );
  }
}
