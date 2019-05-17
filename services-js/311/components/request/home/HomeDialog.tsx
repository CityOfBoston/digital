import React, { FormEvent } from 'react';
import { action, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import Router from 'next/router';

import {
  FetchGraphql,
  GaSiteAnalytics,
  getParam,
} from '@cityofboston/next-client-common';

import { ServiceSummary } from '../../../data/types';
import loadServiceSuggestions from '../../../data/queries/load-service-suggestions';
import loadTopServiceSummaries from '../../../data/queries/load-top-service-summaries';

import FormDialog from '../../common/FormDialog';
import LoadingIcons from '../../common/LoadingIcons';
import { CENTERED_DIALOG_STYLE } from '../../style-constants';
import TranslateDialog from '../translate/TranslateDialog';

import HomePane from './HomePane';
import ChooseServicePane from './ChooseServicePane';
import { GetInitialProps } from '../../../pages/_app';
import { LanguagePreference } from '../../../data/store/BrowserLanguage';
import Ui from '../../../data/store/Ui';
import LiveAgent from '../../../data/store/LiveAgent';

type Stage = 'home' | 'choose';

export type InitialProps = {
  topServiceSummaries: ServiceSummary[];
  description: string;
  stage: Stage;
  bypassTranslateDialog: boolean;
};

export type Props = InitialProps & {
  fetchGraphql: FetchGraphql;
  siteAnalytics: GaSiteAnalytics;
  ui: Ui;
  liveAgent: LiveAgent;
  languages: LanguagePreference[];
};

@observer
export default class HomeDialog extends React.Component<Props> {
  @observable private description: string = '';

  @observable.shallow
  private suggestedServiceSummaries: (ServiceSummary[]) | null = null;
  private lastSuggestedServiceSummariesPromise: Promise<
    ServiceSummary[]
  > | null = null;
  private serviceSuggestionsDisposer: Function | null = null;

  // Called by RequestLayout
  static getInitialProps: GetInitialProps<
    InitialProps,
    'query',
    'fetchGraphql'
  > = async ({ query }, { fetchGraphql }): Promise<InitialProps> => {
    const { stage, description, translate } = query;

    return {
      topServiceSummaries: await loadTopServiceSummaries(fetchGraphql, 5),
      stage: stage === 'choose' ? stage : 'home',
      description: getParam(description, ''),
      bypassTranslateDialog: translate === '0',
    };
  };

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
    const { siteAnalytics } = this.props;

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
      `/request?description=${encodeURIComponent(this.description.trim())}`
    ).then(() => window.scrollTo(0, 0));
  }

  render() {
    const { stage, bypassTranslateDialog, languages } = this.props;

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
    const { topServiceSummaries, liveAgent, ui } = this.props;
    return (
      <HomePane
        liveAgent={liveAgent}
        ui={ui}
        description={this.description}
        handleDescriptionChanged={this.handleDescriptionChanged}
        nextFn={this.routeToChoose}
        topServiceSummaries={topServiceSummaries}
      />
    );
  }

  renderServicePicker() {
    const { ui, siteAnalytics } = this.props;
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
