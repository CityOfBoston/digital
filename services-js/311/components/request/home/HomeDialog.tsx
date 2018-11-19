import React, { ChangeEvent, FormEvent } from 'react';
import { action, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import Router from 'next/router';
import getConfig from 'next/config';
import {
  makeFetchGraphql,
  FetchGraphql,
  NextContext,
} from '@cityofboston/next-client-common';

import { ServiceSummary } from '../../../data/types';
import { AppStore, LanguagePreference } from '../../../data/store';
import loadServiceSuggestions from '../../../data/queries/load-service-suggestions';
import loadTopServiceSummaries from '../../../data/queries/load-top-service-summaries';

import FormDialog from '../../common/FormDialog';
import LoadingIcons from '../../common/LoadingIcons';
import { CENTERED_DIALOG_STYLE } from '../../style-constants';
import TranslateDialog from '../translate/TranslateDialog';

import HomePane from './HomePane';
import ChooseServicePane from './ChooseServicePane';

type Stage = 'home' | 'choose';

export type InitialProps = {
  topServiceSummaries: ServiceSummary[];
  description: string;
  stage: Stage;
  bypassTranslateDialog: boolean;
};

export type Props = InitialProps & {
  store: AppStore;
  fetchGraphql: FetchGraphql;
};

@observer
export default class HomeDialog extends React.Component<Props> {
  @observable description: string = '';

  @observable.shallow
  suggestedServiceSummaries: (ServiceSummary[]) | null = null;
  lastSuggestedServiceSummariesPromise: Promise<ServiceSummary[]> | null = null;
  serviceSuggestionsDisposer: Function | null = null;

  // Called by RequestLayout
  static async getInitialProps({
    query,
  }: NextContext<never>): Promise<InitialProps> {
    const { stage, description, translate } = query;
    const fetchGraphql = makeFetchGraphql(getConfig());

    return {
      topServiceSummaries: await loadTopServiceSummaries(fetchGraphql, 5),
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
      this.lastSuggestedServiceSummariesPromise = loadServiceSuggestions(
        this.props.fetchGraphql,
        description
      );

      const suggestedServiceSummaries = await this
        .lastSuggestedServiceSummariesPromise;

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
  handleDescriptionChanged(ev: FormEvent<HTMLTextAreaElement>) {
    this.description = ev.currentTarget.value;
  }

  @action.bound
  routeToChoose() {
    const { lastSuggestedServiceSummariesPromise, description } = this;
    const {
      store: { siteAnalytics },
    } = this.props;

    // We send site analytics only when routing to the choose dialog so that we
    // don't send events for the autocomplete preloading.
    if (lastSuggestedServiceSummariesPromise) {
      lastSuggestedServiceSummariesPromise.then(arr => {
        if (arr.length) {
          siteAnalytics.sendEvent('results', {
            category: 'Prediction',
            label: description,
            value: arr.length,
          });
        } else {
          siteAnalytics.sendEvent('no-results', {
            category: 'Prediction',
            label: description,
            value: 0,
          });
        }
      });
    }

    Router.push(
      `/request?stage=choose&description=${encodeURIComponent(
        this.description.trim()
      )}`,
      '/request'
    ).then(() => window.scrollTo(0, 0));
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
    const {
      store: { ui, siteAnalytics },
    } = this.props;
    return (
      <ChooseServicePane
        description={this.description}
        suggestedServiceSummaries={this.suggestedServiceSummaries}
        ui={ui}
        siteAnalytics={siteAnalytics}
      />
    );
  }
}
