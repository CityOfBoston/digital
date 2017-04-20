// @flow

import React from 'react';
import { css } from 'glamor';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';

import type { ServiceSummary } from '../../../data/types';

import { MEDIA_LARGE } from '../../style-constants';
import SectionHeader from '../../common/SectionHeader';
import DescriptionBox from '../../common/DescriptionBox';

const DESCRIPTION_HEADER_STYLE = css({
  display: 'none',
  [MEDIA_LARGE]: {
    display: 'block',
  },
});

const NEXT_BUTTON_STYLE = css({
  width: '100%',
  [MEDIA_LARGE]: {
    width: 'auto',
  },
});

const SERVICE_PICKER_STYLE = css({
  display: 'none',
  [MEDIA_LARGE]: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export type Props = {
  description: string,
  handleDescriptionChanged: (ev: SyntheticInputEvent) => mixed,
  topServiceSummaries: ServiceSummary[],
}

// Button handler rather than a link so we can disable it and because it
// leads to a page that doesn't (currently?) accept GET requests.
function handleNextClick() {
  Router.push('/report?stage=choose', '/report');
}

export default function HomePane({ description, handleDescriptionChanged, topServiceSummaries }: Props) {
  return (
    <div>
      <Head>
        <title>BOS:311 — Report a Problem</title>
      </Head>

      <SectionHeader>File a Report</SectionHeader>

      <div className="t--intro m-v300">
        Through BOS:311, you can report non-emergency issues with the City.
      </div>

      <div className="g m-t500">
        <div className="g--7">
          <h3 className={`stp m-v100 ${DESCRIPTION_HEADER_STYLE.toString()}`}>
            Tell us your problem
          </h3>

          <DescriptionBox
            minHeight={222}
            maxHeight={222}
            text={description}
            placeholder="Example: my street hasn’t been plowed"
            onInput={handleDescriptionChanged}
          />

          <div className="m-t500" style={{ textAlign: 'right' }}>
            <button disabled={description.length === 0} className={`btn ${NEXT_BUTTON_STYLE.toString()}`} onClick={handleNextClick}>Start a Report</button>
          </div>
        </div>

        <div className="g--1" />

        <div className={`g--4 ${SERVICE_PICKER_STYLE.toString()}`}>
          <div className="m-v300 t--info">
            You can also start a report by picking one of these
            popular services:
          </div>

          <ul className="ul">{ topServiceSummaries.map(({ code, name }) => (
            <li key={code}>
              <Link href={`/report?code=${code}`} as={`/report/${code}`}><a className="t--sans tt-u">{name}</a></Link>
            </li>
          )) }</ul>
.
          <div className="t--info m-v300" style={{ textAlign: 'right' }}>
            <a href="javasscript:void(0)">See all services…</a>
          </div>
        </div>
      </div>

    </div>
  );
}
