// @flow

import React from 'react';
import { css } from 'glamor';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';
import debounce from 'lodash/debounce';

import type { ServiceSummary } from '../../../data/types';
import type { AppStore } from '../../../data/store';
import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import loadServiceSuggestions from '../../../data/dao/load-service-suggestions';

import { MEDIA_LARGE } from '../../style-constants';
import FormDialog from '../../common/FormDialog';
import SectionHeader from '../../common/SectionHeader';
import DescriptionBox from '../../common/DescriptionBox';
import ServiceList from './ServiceList';

export type Props = {
  store: AppStore,
  routeToServiceForm: (code: ?string) => mixed,
  // eslint-disable-next-line react/no-unused-prop-types
  stage: 'home' | 'service',
  loopbackGraphql: LoopbackGraphql,
};

const NEXT_BUTTON_STYLE = css({
  width: '100%',
  [MEDIA_LARGE]: {
    display: 'none',
  },
});

const SERVICE_PICKER_STYLE = css({
  display: 'none',
  [MEDIA_LARGE]: {
    display: 'block',
  },
});

type SuggestServicesArgs = {
  description: string,
};

@observer
export default class HomeDialog extends React.Component {
  props: Props;

  @observable.shallow suggestedServiceSummaries: ServiceSummary[] = [];
  serviceSuggestionsDisposer: ?Function

  componentDidMount() {
    this.serviceSuggestionsDisposer = reaction(
      (): SuggestServicesArgs => ({ description: this.props.store.requestForm.description }),
      debounce(this.suggestServices, 500),
      {
        fireImmediately: true,
        compareStructural: true,
        name: 'update service suggestions from description',
      },
    );
  }

  componentWillUnmount() {
    if (this.serviceSuggestionsDisposer) {
      this.serviceSuggestionsDisposer();
    }
  }

  @computed get serviceSummaries(): ServiceSummary[] {
    if (this.suggestedServiceSummaries.length > 0) {
      return this.suggestedServiceSummaries;
    } else {
      return this.props.store.serviceSummaries;
    }
  }

  @action.bound
  async suggestServices({ description }: SuggestServicesArgs) {
    if (description === '') {
      this.suggestedServiceSummaries = [];
    } else {
      const suggestedServiceSummaries = await loadServiceSuggestions(this.props.loopbackGraphql, description);

      runInAction('suggestServices result', () => {
        this.suggestedServiceSummaries = suggestedServiceSummaries;
      });
    }
  }

  render() {
    const { stage } = this.props;
    switch (stage) {
      case 'home': return this.renderHome();
      case 'service': return this.renderServicePicker();
      default: return null;
    }
  }

  renderHome() {
    const { store, routeToServiceForm } = this.props;

    return (
      <FormDialog>
        <Head>
          <title>BOS:311 — Report a Problem</title>
        </Head>

        <SectionHeader>File a Report with BOS:311</SectionHeader>

        <div className="g m-v500">
          <div className="g--8">
            <h3 className="stp m-v300">
              <span className="stp-number">1</span>
              Tell us your problem
            </h3>

            <DescriptionBox
              minHeight={222}
              maxHeight={222}
              text={store.requestForm.description}
              placeholder="Example: my street hasn’t been plowed"
              onInput={action((ev) => { store.requestForm.description = ev.target.value; })}
            />
          </div>

          <div className={`g--4 ${SERVICE_PICKER_STYLE.toString()}`}>
            <h3 className="stp m-v300">
              <span className="stp-number">2</span>
              How can we help?
            </h3>
            <div style={{ height: 222, overflowY: 'auto' }}>
              <ServiceList serviceSummaries={this.serviceSummaries} onServiceChosen={routeToServiceForm} />
            </div>
          </div>
        </div>

        <button className={`btn ${NEXT_BUTTON_STYLE.toString()}`} onClick={() => { routeToServiceForm(); }}>Next</button>

        <div className="t--info">
          Through BOS:311, you can report non-emergency issues with the City.<br />
          To make things easier, you can use this form to file reports online.
        </div>
      </FormDialog>
    );
  }

  renderServicePicker() {
    const { routeToServiceForm } = this.props;
    return (
      <FormDialog>
        <Head>
          <title>BOS:311 — Report a Problem</title>
        </Head>

        <SectionHeader>File a Report with BOS:311</SectionHeader>

        <div className="m-v500">
          <h3 className="stp m-v300">
            <span className="stp-number">2</span>
            How can we help?
          </h3>
          <div style={{ height: 222, overflowY: 'auto' }}>
            <ServiceList serviceSummaries={this.serviceSummaries} onServiceChosen={routeToServiceForm} />
          </div>
        </div>
      </FormDialog>
    );
  }
}
