// @flow

import React from 'react';
import { css } from 'glamor';
import Link from 'next/link';
import SectionHeader from '../../common/SectionHeader';

import type { SubmittedRequest } from '../../../data/types';

export type Props = {
  state: 'submitting',
} | {
  state: 'error',
  error: Object,
} | {
  state: 'success',
  submittedRequest: SubmittedRequest,
};

const GRID_OVERRIDE_STYLE = css({
  alignItems: 'flex-start',
});

export default function SubmitPane(props: Props) {
  switch (props.state) {
    case 'submitting':
      return (
        <div>
          <SectionHeader>Submitting…</SectionHeader>
        </div>
      );

    case 'error': {
      const { error } = props;
      return (
        <div>
          <SectionHeader>Submission Error</SectionHeader>
          { Array.isArray(error.errors) && error.errors.map((e, i) => <p key={i}>{e.message}</p>) }
          { !Array.isArray(error.errors) && (error.message ? error.message : error.toString()) }
        </div>
      );
    }

    case 'success': {
      const { submittedRequest } = props;
      return (
        <div>
          <SectionHeader>Thank you for your submission</SectionHeader>
          <div className="m-v500">
            <div className={`g ${GRID_OVERRIDE_STYLE.toString()}`}>
              <div className="m-v300 g--6">
                <ul className="dl">
                  <li className="dl-i">
                    <span className="dl-t">Case No.</span>
                    <span className="dl-d dl-d--tt-n"><Link href={`/lookup?q=${submittedRequest.id}`}><a>{ submittedRequest.id }</a></Link></span>
                  </li>
                  <li className="dl-i">
                    <span className="dl-t">Opened</span>
                    <span className="dl-d dl-d--tt-n">{ submittedRequest.requestedAtString }</span>
                  </li>
                  <li className="dl-i">
                    <span className="dl-t">Where</span>
                    <span className="dl-d dl-d--tt-n">{ submittedRequest.address }</span>
                  </li>
                  <li className="dl-i">
                    <span className="dl-t">Description</span>
                    <span className="dl-d dl-d--tt-n">{ submittedRequest.description }</span>
                  </li>
                </ul>
              </div>

              <img style={{ display: 'block' }} alt="" src={submittedRequest.mediaUrl || '/static/img/311-watermark.svg'} className="g--6" />
            </div>

            <hr className="hr hr--dash m-v300" />

            <div className="m-v500">
              <div className="g">
                <Link href="/"><a className="g--33 ta-c btn">Create a New Case</a></Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
