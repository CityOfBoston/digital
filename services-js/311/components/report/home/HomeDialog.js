// @flow

import React from 'react';
import { action, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'glamor';
import debounce from 'lodash/debounce';
import type { Context } from 'next';
import Router from 'next/router';

import type { RequestAdditions } from '../../../server/next-handlers';

import type { ServiceSummary } from '../../../data/types';
import type { AppStore } from '../../../data/store';
import makeLoopbackGraphql from '../../../data/dao/loopback-graphql';
import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import loadServiceSuggestions from '../../../data/dao/load-service-suggestions';
import loadTopServiceSummaries from '../../../data/dao/load-top-service-summaries';

import FormDialog from '../../common/FormDialog';
import LoadingIcons from '../../common/LoadingIcons';
import { HEADER_HEIGHT, MEDIA_LARGE, CENTERED_DIALOG_STYLE } from '../../style-constants';

import HomePane from './HomePane';
import ChooseServicePane from './ChooseServicePane';

type Stage = 'home' | 'choose';

export type InitialProps = {|
  topServiceSummaries: ServiceSummary[],
  description: string,
  stage: Stage,
|}

export type Props = {|
  store: AppStore,
  loopbackGraphql: LoopbackGraphql,
  /* :: ...InitialProps, */
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

  @observable description: string;

  @observable.shallow suggestedServiceSummaries: ?ServiceSummary[] = null;
  serviceSuggestionsDisposer: ?Function

  // Called by ReportLayout
  static async getInitialProps({ query, req }: Context<RequestAdditions>): Promise<InitialProps> {
    const { stage, description } = query;
    const loopbackGraphql = makeLoopbackGraphql(req);

    return {
      topServiceSummaries: await loadTopServiceSummaries(loopbackGraphql, 5),
      stage: stage === 'choose' ? stage : 'home',
      description: description || '',
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
      },
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
    this.description = ev.target.value;
  }

  @action.bound
  routeToChoose() {
    Router.push(`/report?stage=choose&description=${encodeURIComponent(this.description)}`, '/report');
  }

  render() {
    const { stage } = this.props;

    const narrow = (stage === 'choose');

    return (
      <div>
        <div className={SCREENFULL_CONTAINER}>
          <div className={CENTERED_DIALOG_STYLE}>
            <FormDialog narrow={narrow} noPadding>
              { stage === 'home' && this.renderHome() }
              { stage === 'choose' && this.renderServicePicker() }
            </FormDialog>
          </div>
        </div>
      </div>
    );
  }

  renderHome() {
    const { topServiceSummaries, store } = this.props;
    return (
      <HomePane store={store} description={this.description} handleDescriptionChanged={this.handleDescriptionChanged} nextFn={this.routeToChoose} topServiceSummaries={topServiceSummaries} />
    );
  }

  renderServicePicker() {
    return (
      <ChooseServicePane description={this.description} suggestedServiceSummaries={this.suggestedServiceSummaries} />
    );
  }
}
