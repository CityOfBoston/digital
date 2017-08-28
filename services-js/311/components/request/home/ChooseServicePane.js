// @flow

import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { css } from 'glamor';

import type { ServiceSummary } from '../../../data/types';
import type Ui from '../../../data/store/Ui';

import SectionHeader from '../../common/SectionHeader';
import LoadingIcons from '../../common/LoadingIcons';

export type Props = {|
  description: string,
  suggestedServiceSummaries: ?(ServiceSummary[]),
  ui: Ui,
|};

const LOADING_INDICATORS_STYLE = css({
  overflow: 'hidden',
});

const LOADING_INDICATOR_WRAPPER_STYLE = css({
  height: 120,
  display: 'flex',
  flexDirection: 'column',
});

function renderSummaryRow(
  problemDescription: string,
  {
    code,
    name,
    description,
  }: { code: string, name: string, description: ?string }
) {
  return (
    <div className="dr" key={code}>
      <Link
        href={`/request?code=${code}&description=${encodeURIComponent(
          problemDescription
        )}`}
        as={`/request/${code}`}
      >
        <a className="dr-h">
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
          <div className="dr-t">
            {name}
          </div>
          <div className="dr-st">
            <span
              className="t--info"
              style={{ textTransform: 'none', fontStyle: 'normal' }}
            >
              {description}
            </span>
          </div>
        </a>
      </Link>
    </div>
  );
}

function renderGeneralRequestRow(problemDescription: string) {
  return renderSummaryRow(problemDescription, {
    code: 'BOS311GEN',
    name: 'General Request',
    // TODO(finh): Add something here
    description: '',
  });
}

function renderLoading(ui: Ui) {
  return (
    <div>
      <div className="t--info">Matching your request to BOS:311 services…</div>

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

function renderSuggestions(
  problemDescription: string,
  suggestedServiceSummaries: ServiceSummary[]
) {
  return (
    <div>
      <div className="t--info">
        We’ve matched these services to your request. Pick one to continue.
      </div>

      <div className="m-v500">
        {suggestedServiceSummaries.map(s =>
          renderSummaryRow(problemDescription, s)
        )}
      </div>

      <div className="t--info m-v300">
        If none of those seem like a good fit, you can submit a General Request.
      </div>

      <div className="m-v500">
        {renderGeneralRequestRow(problemDescription)}
      </div>
    </div>
  );
}

function renderNoSuggestions(problemDescription: string) {
  return (
    <div>
      <div className="t--info m-v300">
        We weren’t able to automatically match your request with a service. File
        a General Request and someone will help you out.
      </div>

      <div className="m-v500">
        {renderGeneralRequestRow(problemDescription)}
      </div>
    </div>
  );
}

export default function ChooseServicePane({
  description,
  suggestedServiceSummaries,
  ui,
}: Props) {
  return (
    <div>
      <Head>
        <title>BOS:311 — Choose a Service</title>
      </Head>

      <div className="p-a300 p-a800--xl" style={{ paddingBottom: '.75rem' }}>
        <SectionHeader>BOS:311 — Choose a Service</SectionHeader>

        {description &&
          <div className="m-v500 t--intro">
            “{description}”
          </div>}
      </div>

      <div className="b b--g p-a300 p-a800--xl">
        {!suggestedServiceSummaries && renderLoading(ui)}
        {suggestedServiceSummaries &&
          suggestedServiceSummaries.length > 0 &&
          renderSuggestions(description, suggestedServiceSummaries)}
        {suggestedServiceSummaries &&
          suggestedServiceSummaries.length === 0 &&
          renderNoSuggestions(description)}
      </div>
    </div>
  );
}
