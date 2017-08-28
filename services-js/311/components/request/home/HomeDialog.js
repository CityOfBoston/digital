// @flow

import * as React from 'react';
import { action, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import type { Context } from 'next';
import Router from 'next/router';

import type { RequestAdditions } from '../../../server/next-handlers';

import type { ServiceSummary } from '../../../data/types';
import type { AppStore, LanguagePreference } from '../../../data/store';
import makeLoopbackGraphql from '../../../data/dao/loopback-graphql';
import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import loadServiceSuggestions from '../../../data/dao/load-service-suggestions';
import loadTopServiceSummaries from '../../../data/dao/load-top-service-summaries';

import FormDialog from '../../common/FormDialog';
import LoadingIcons from '../../common/LoadingIcons';
import { CENTERED_DIALOG_STYLE } from '../../style-constants';
import TranslateDialog from '../translate/TranslateDialog';

import HomePane from './HomePane';
import ChooseServicePane from './ChooseServicePane';

type Stage = 'home' | 'choose';

export type InitialProps = {|
  topServiceSummaries: ServiceSummary[],
  description: string,
  stage: Stage,
  bypassTranslateDialog: boolean,
|};

export type Props = {|
  store: AppStore,
  loopbackGraphql: LoopbackGraphql,
  ...InitialProps,
|};

@observer
export default class HomeDialog extends React.Component<Props> {
  @observable description: string;

  @observable.shallow suggestedServiceSummaries: ?(ServiceSummary[]) = null;
  serviceSuggestionsDisposer: ?Function;

  // Called by RequestLayout
  static async getInitialProps({
    query,
    req,
  }: Context<RequestAdditions>): Promise<InitialProps> {
    const { stage, description, translate } = query;
    const loopbackGraphql = makeLoopbackGraphql(req);

    return {
      topServiceSummaries: await loadTopServiceSummaries(loopbackGraphql, 5),
      stage: stage === 'choose' ? stage : 'home',
      description: description || '',
      bypassTranslateDialog: translate === '0',
    };
  }

  @action
  componentWillMount() {
    this.description = this.props.description;
  }

  componentDidMount() {
    this.serviceSuggestionsDisposer = reaction(
      () => this.description,
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
      }
    );

    LoadingIcons.preload();
  }

  componentWillUnmount() {
    if (this.serviceSuggestionsDisposer) {
      this.serviceSuggestionsDisposer();
    }
  }

  suggestServices = debounce(async (description: string) => {
    try {
      const suggestedServiceSummaries = await loadServiceSuggestions(
        this.props.loopbackGraphql,
        description
      );

      runInAction('suggestServices result', () => {
        this.suggestedServiceSummaries = suggestedServiceSummaries;
      });
    } catch (e) {
      runInAction('suggestServices error', () => {
        this.suggestedServiceSummaries = [];
      });
      throw e;
    }
  }, 500);

  @action.bound
  handleDescriptionChanged(ev: SyntheticInputEvent<>) {
    this.description = ev.target.value;
  }

  @action.bound
  routeToChoose() {
    Router.push(
      `/request?stage=choose&description=${encodeURIComponent(
        this.description
      )}`,
      '/request'
    );
  }

  render() {
    const { stage, store, bypassTranslateDialog } = this.props;
    const languages: LanguagePreference[] = store.languages;

    const translateLanguage = TranslateDialog.findLanguage(languages);
    const showTranslate =
      translateLanguage &&
      translateLanguage !== 'en' &&
      !bypassTranslateDialog &&
      stage === 'home';

    const narrow = stage === 'choose';

    if (showTranslate) {
      return <TranslateDialog languages={languages} showContinueInEnglish />;
    }

    return (
      <div className={CENTERED_DIALOG_STYLE}>
        <FormDialog narrow={narrow} noPadding>
          {stage === 'home' && this.renderHome()}
          {stage === 'choose' && this.renderServicePicker()}
        </FormDialog>
      </div>
    );
  }

  renderHome() {
    const { topServiceSummaries, store } = this.props;
    return (
      <HomePane
        store={store}
        description={this.description}
        handleDescriptionChanged={this.handleDescriptionChanged}
        nextFn={this.routeToChoose}
        topServiceSummaries={topServiceSummaries}
      />
    );
  }

  renderServicePicker() {
    const { store: { ui } } = this.props;
    return (
      <ChooseServicePane
        description={this.description}
        suggestedServiceSummaries={this.suggestedServiceSummaries}
        ui={ui}
      />
    );
  }
}
