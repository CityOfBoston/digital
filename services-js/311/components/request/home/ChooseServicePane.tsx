import React, { MouseEvent } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { css } from 'emotion';
import { SiteAnalytics } from '@cityofboston/next-client-common/build/SiteAnalytics';

import { ServiceSummary } from '../../../data/types';
import Ui from '../../../data/store/Ui';

import SectionHeader from '../../common/SectionHeader';
import LoadingIcons from '../../common/LoadingIcons';

export type Props = {
  description: string;
  suggestedServiceSummaries: (ServiceSummary[]) | null;
  ui: Ui;
  siteAnalytics: SiteAnalytics;
};

const LOADING_INDICATORS_STYLE = css({
  overflow: 'hidden',
});

const LOADING_INDICATOR_WRAPPER_STYLE = css({
  height: 120,
  display: 'flex',
  flexDirection: 'column',
});

const GENERAL_REQUEST_SUMMARY = {
  code: 'BOS311GEN',
  name: 'General Request',
  // TODO(finh): Add something here
  description: '',
};

type RowProps = {
  problemDescription: string;
  suggestionCount: number;
  suggestionNum?: number;
  isGeneral?: boolean;
  // Not a ServiceSummary so we can easily fake out for the general request row
  summary: {
    code: string;
    name: string;
    description: string | null;
  };
  siteAnalytics: SiteAnalytics;
};

class SuggestionRow extends React.Component<RowProps> {
  static defaultProps = {
    isGeneral: false,
  };

  handleClick = (ev: MouseEvent<HTMLElement>) => {
    const {
      problemDescription,
      isGeneral,
      siteAnalytics,
      summary: { code },
      suggestionNum,
      suggestionCount,
    } = this.props;

    let action;
    if (isGeneral && suggestionCount === 0) {
      action = 'pick general (no suggestions)';
    } else if (isGeneral && suggestionCount > 0) {
      action = 'pick general (suggestions available)';
    } else {
      action = 'pick suggestion';
    }

    siteAnalytics.sendEvent(action, {
      category: 'Prediction',
      label: code,
      value: suggestionNum,
    });

    if (
      ev.currentTarget.nodeName === 'A' &&
      (ev.metaKey ||
        ev.ctrlKey ||
        ev.shiftKey ||
        (ev.nativeEvent && ev.nativeEvent.which === 2))
    ) {
      // ignore click for new tab / new window behavior
      return;
    }

    ev.preventDefault();

    // We use Router instead of Link because Link doesn't support custom onClick
    // handlers, which we need for reporting.
    Router.push(
      `/request?code=${code}&description=${encodeURIComponent(
        problemDescription
      )}`,
      `/request/${code}`
    );
  };

  render() {
    const {
      summary: { code, description, name },
    } = this.props;

    return (
      <div className="dr" key={code}>
        <a
          onClick={this.handleClick}
          href={`/request/${code}`}
          className="dr-h"
        >
          <div
            className="dr-ic"
            style={{ transform: 'translateY(-49%) rotateZ(-90deg)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 8.5 18 25">
              <path
                className="dr-i"
                d="M16 21L.5 33.2c-.6.5-1.5.4-2.2-.2-.5-.6-.4-1.6.2-2l12.6-10-12.6-10c-.6-.5-.7-1.5-.2-2s1.5-.7 2.2-.2L16 21z"
              />
            </svg>
          </div>
          <div className="dr-t">{name}</div>
          <div className="dr-st">
            <span
              className="t--info"
              style={{ textTransform: 'none', fontStyle: 'normal' }}
            >
              {description}
            </span>
          </div>
        </a>
      </div>
    );
  }
}

export default class ChooseServicePane extends React.Component<Props> {
  render() {
    const { description, suggestedServiceSummaries } = this.props;
    return (
      <div>
        <Head>
          <title>BOS:311 — Choose a Service</title>
        </Head>

        <div className="p-a300 p-a800--xl" style={{ paddingBottom: '.75rem' }}>
          <SectionHeader>BOS:311 — Choose a Service</SectionHeader>

          {description && (
            <div className="m-v500 t--intro">“{description}”</div>
          )}
        </div>

        <div className="b b--g p-a300 p-a800--xl">
          {!suggestedServiceSummaries && this.renderLoading()}
          {suggestedServiceSummaries &&
            suggestedServiceSummaries.length > 0 &&
            this.renderSuggestions(suggestedServiceSummaries)}
          {suggestedServiceSummaries &&
            suggestedServiceSummaries.length === 0 &&
            this.renderNoSuggestions()}
        </div>
      </div>
    );
  }

  renderLoading() {
    const { ui } = this.props;

    return (
      <div>
        <div className="t--info">
          Matching your request to BOS:311 services…
        </div>

        <div className={`p-a300 g ${LOADING_INDICATORS_STYLE.toString()}`}>
          <div className={`g--4 ${LOADING_INDICATOR_WRAPPER_STYLE.toString()}`}>
            <LoadingIcons initialDelay={0} reduceMotion={ui.reduceMotion} />
          </div>
          <div className={`g--4 ${LOADING_INDICATOR_WRAPPER_STYLE.toString()}`}>
            <LoadingIcons initialDelay={100} reduceMotion={ui.reduceMotion} />
          </div>
          <div className={`g--4 ${LOADING_INDICATOR_WRAPPER_STYLE.toString()}`}>
            <LoadingIcons initialDelay={200} reduceMotion={ui.reduceMotion} />
          </div>
        </div>
      </div>
    );
  }

  renderSuggestions(suggestedServiceSummaries: Array<ServiceSummary>) {
    const { description, siteAnalytics } = this.props;

    return (
      <div>
        <div className="t--info">
          We’ve matched these services to your request. Pick one to continue.
        </div>

        <div className="m-v500">
          {suggestedServiceSummaries.map((s, idx) => (
            <SuggestionRow
              key={s.code}
              problemDescription={description}
              summary={s}
              suggestionNum={idx + 1}
              suggestionCount={suggestedServiceSummaries.length}
              siteAnalytics={siteAnalytics}
            />
          ))}
        </div>

        <div className="t--info m-v300">
          If none of those seem like a good fit, you can submit a General
          Request.
        </div>

        <div className="m-v500">
          <SuggestionRow
            isGeneral
            problemDescription={description}
            summary={GENERAL_REQUEST_SUMMARY}
            suggestionCount={suggestedServiceSummaries.length}
            siteAnalytics={siteAnalytics}
          />
        </div>
      </div>
    );
  }

  renderNoSuggestions() {
    const { description, siteAnalytics } = this.props;

    return (
      <div>
        <div className="t--info m-v300">
          We weren’t able to automatically match your request with a service.
          File a General Request and someone will help you out.
        </div>

        <div className="m-v500">
          <SuggestionRow
            isGeneral
            problemDescription={description}
            summary={GENERAL_REQUEST_SUMMARY}
            suggestionCount={0}
            siteAnalytics={siteAnalytics}
          />
        </div>
      </div>
    );
  }
}
