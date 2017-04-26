// @flow

import React from 'react';
import { css } from 'glamor';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { now } from 'mobx-utils';
import Head from 'next/head';
import Link from 'next/link';

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

export type Props = {|
  description: string,
  handleDescriptionChanged: (ev: SyntheticInputEvent) => mixed,
  nextFn: () => mixed,
  topServiceSummaries: ServiceSummary[],
|}

const EXAMPLE_PROBLEMS = [
  'My street hasn’t been plowed',
  'There’s a dead squirrel on the sidewalk',
  'I need a refrigerator picked up',
  'Needles in the park!!!',
  'My recycle bin is broken',
  'Fix the pothole on Comm Ave',
];

const TIME_PER_PLACEHOLDER_MS = 5 * 1000;
const TIME_PER_CHARACTER_MS = 100;

@observer
export default class HomePane extends React.Component {
  @observable textareaFocus: boolean = false;
  @observable animationStartMs: number = 0;

  @action
  componentDidMount() {
    this.animationStartMs = +new Date();
  }

  @action.bound
  handleDescriptionFocus() {
    this.textareaFocus = true;
  }

  @action.bound
  handleDescriptionBlur() {
    this.textareaFocus = false;
  }

  @computed get placeholder(): string {
    if (this.props.description || this.textareaFocus || !this.animationStartMs) {
      return '';
    }

    const msSinceStart = Math.max(0, now(100) - this.animationStartMs);

    const placeholderIdx = Math.floor(msSinceStart / TIME_PER_PLACEHOLDER_MS) % EXAMPLE_PROBLEMS.length;
    const timeInPlaceholder = msSinceStart % TIME_PER_PLACEHOLDER_MS;

    return EXAMPLE_PROBLEMS[placeholderIdx].substring(0, Math.floor(timeInPlaceholder / TIME_PER_CHARACTER_MS));
  }

  render() {
    const { description, handleDescriptionChanged, nextFn, topServiceSummaries } = this.props;
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
              Tell us your problem:
            </h3>

            <DescriptionBox
              minHeight={152}
              maxHeight={222}
              text={description}
              placeholder={this.placeholder}
              onInput={handleDescriptionChanged}
              onFocus={this.handleDescriptionFocus}
              onBlur={this.handleDescriptionBlur}
            />

            <div className="m-t500" style={{ textAlign: 'right' }}>
              <button disabled={description.length === 0} className={`btn ${NEXT_BUTTON_STYLE.toString()}`} onClick={nextFn}>Start a Report</button>
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
          <div className="t--info" style={{ textAlign: 'right' }}>
            <Link href="/services"><a>See all services…</a></Link>
          </div>
          </div>
        </div>

      </div>
    );
  }
}
