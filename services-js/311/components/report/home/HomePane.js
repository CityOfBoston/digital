// @flow
/* global liveagent */
/* eslint jsx-a11y/no-static-element-interactions: 0 */

import React from 'react';
import { css } from 'glamor';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { now } from 'mobx-utils';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';

import type { ServiceSummary } from '../../../data/types';
import type { AppStore } from '../../../data/store';

import { MEDIA_LARGE } from '../../style-constants';
import SectionHeader from '../../common/SectionHeader';
import DescriptionBox from '../../common/DescriptionBox';

const FORM_COLUMN_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const NEXT_BUTTON_STYLE = css({
  width: '100%',
  [MEDIA_LARGE]: {
    width: 'auto',
  },
});

const OR_HOLDER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [MEDIA_LARGE]: {
    margin: 0,
  },
});

const OR_RULE_STYLE = css({
  flex: 1,
  borderColor: '#828282',
  borderTopWidth: 0,
  borderRightWidth: 0,
  borderBottomWidth: 0,
});

const OR_CIRCLE_SYTLE = css({
  textAlign: 'center',
  borderRadius: '50%',
  color: '#828282',
  borderColor: '#828282',
  width: '2.5em',
  height: '2.5em',
  lineHeight: '2.1em',
});

const SEARCH_CONTAINER_STYLE = css({
  display: 'none',
  [MEDIA_LARGE]: {
    display: 'block',
  },
});

const BROWSE_CASES_STYLE = css({
  display: 'flex',
  alignItems: 'center',
});

export type Props = {|
  store: AppStore,
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
  props: Props;

  @observable textareaFocus: boolean = false;
  @observable animationStartMs: number = 0;

  @observable searchValue: string = '';

  descriptionTextarea: ?HTMLElement = null;

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

  @action.bound
  handleSearchFocus() {
    Router.prefetch('/search');
  }

  @action.bound
  handleSearchInput(ev: SyntheticInputEvent) {
    this.searchValue = ev.target.value;
  }

  @action.bound
  handleSearchSubmit(ev: SyntheticInputEvent) {
    ev.preventDefault();
    const encodedSearch = encodeURIComponent(this.searchValue);
    Router.push(`/search?q=${encodedSearch}`);
  }

  @action.bound
  setTextarea(textarea: ?HTMLElement) {
    this.descriptionTextarea = textarea;
  }

  @action.bound
  startChat() {
    const { store } = this.props;
    const { liveAgentButtonId } = store;

    liveagent.startChat(liveAgentButtonId);
  }

  @computed get placeholder(): string {
    const { description, store } = this.props;

    if (description || !store.ui.visible || this.textareaFocus || !this.animationStartMs) {
      return '';
    }

    const msSinceStart = Math.max(0, now(100) - this.animationStartMs);

    const placeholderIdx = Math.floor(msSinceStart / TIME_PER_PLACEHOLDER_MS) % EXAMPLE_PROBLEMS.length;
    const timeInPlaceholder = msSinceStart % TIME_PER_PLACEHOLDER_MS;

    return EXAMPLE_PROBLEMS[placeholderIdx].substring(0, Math.floor(timeInPlaceholder / TIME_PER_CHARACTER_MS));
  }

  @action.bound
  nextButtonWrapperClick(ev: SyntheticInputEvent) {
    if (this.descriptionTextarea) {
      this.descriptionTextarea.focus();
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  render() {
    const { description, handleDescriptionChanged, nextFn, topServiceSummaries, store } = this.props;
    return (
      <div>
        <Head>
          <title>BOS:311 — Report a Problem</title>
        </Head>

        <div className="p-a300 p-a800--xl">
          <SectionHeader>BOS:311 — File a Report</SectionHeader>

          <div className="t--info m-v300" style={{ fontStyle: 'normal' }}>
            Through BOS:311, you can report non-emergency issues with the City.
          </div>

          <div className="g m-t500">
            <div className={`g--7 ${FORM_COLUMN_STYLE.toString()}`}>
              <div>
                <h2 className="stp m-v100">
                  Tell us your problem:
                </h2>

                <DescriptionBox
                  minHeight={137}
                  maxHeight={222}
                  text={description}
                  placeholder={this.placeholder}
                  onInput={handleDescriptionChanged}
                  onFocus={this.handleDescriptionFocus}
                  onBlur={this.handleDescriptionBlur}
                  setTextarea={this.setTextarea}
                />
              </div>

              <div className="m-t500" style={{ textAlign: 'right' }}>
                { store.liveAgentAvailable && <button className="btn m-h100" onClick={this.startChat}>Start Live Chat</button> }
                <span style={{ position: 'relative' }}>
                  <button disabled={description.length === 0} className={`btn ${NEXT_BUTTON_STYLE.toString()}`} onClick={nextFn}>Start a Report</button>
                  { description.length === 0 && <span style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} onClick={this.nextButtonWrapperClick} role="presentation" /> }
                </span>
              </div>
            </div>

            <div className={`g--1 m-v300 ${OR_HOLDER_STYLE.toString()}`}>
              <div className={`br br-a150 ${OR_RULE_STYLE.toString()}`} />
              <div className={`br br-a150 t--info ${OR_CIRCLE_SYTLE.toString()}`}>or</div>
              <div className={`br br-a150 ${OR_RULE_STYLE.toString()}`} />
            </div>

            <div className="g--4">
              <h2 className="a11y--h">Popular Services</h2>

              <div className="t--info" style={{ fontStyle: 'normal' }}>
                You can also start a report by picking one of these
                popular services:
              </div>

              <ul className="ul m-v300">{ topServiceSummaries.map(({ code, name }) => (
                <li key={code} className="t--info">
                  <Link href={`/report?code=${code}`} as={`/report/${code}`}><a className="m-v100">{name}</a></Link>
                </li>
            )) }</ul>

              <div className="t--info">
                <Link href="/services"><a>See all services…</a></Link>
              </div>
            </div>
          </div>
        </div>

        <div className={`b b--g p-a300 p-a800--xl ${SEARCH_CONTAINER_STYLE.toString()}`} style={{ paddingTop: 0, paddingBottom: 0 }} role="search">
          <h2 className="a11y--h">Public Reports</h2>
          <div className="g">
            <form className="sf sf--y sf--md g--7 m-v400" acceptCharset="UTF-8" method="get" action="/lookup" onSubmit={this.handleSearchSubmit}>
              <div className="sf-i">
                <input type="text" name="q" placeholder="Search by case ID or keywords…" aria-label="Search field" value={this.searchValue} onChange={this.handleSearchInput} onFocus={this.handleSearchFocus} className="sf-i-f" />
                <button type="submit" className="sf-i-b">Search</button>
              </div>
            </form>

            <div className="g--1" />

            <div className={`g--4 t--info ${BROWSE_CASES_STYLE.toString()}`}>
              <Link href="/search"><a>Browse public cases</a></Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
