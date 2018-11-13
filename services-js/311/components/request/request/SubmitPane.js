// @flow

import React from 'react';
import Link from 'next/link';
import { css } from 'glamor';
import SectionHeader from '../../common/SectionHeader';
import LoadingBuildings from '../../common/LoadingBuildings';
import type Ui from '../../../data/store/Ui';

export type Props =
  | {|
      state: 'submitting',
      ui: Ui,
    |}
  | {|
      state: 'error',
      error: Object,
      backUrl: string,
      backUrlAs: string,
    |};

const LOADING_CONTAINER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  height: 400,
});

export default function SubmitPane(props: Props) {
  switch (props.state) {
    case 'submitting':
      return (
        <div>
          <SectionHeader>Submitting…</SectionHeader>

          <div className="t--intro m-v500">
            Please wait while we save your request.
          </div>

          <div
            className={`m-v500 p-a500 ${LOADING_CONTAINER_STYLE.toString()}`}
          >
            <LoadingBuildings reduceMotion={props.ui.reduceMotion} />
          </div>
        </div>
      );

    case 'error': {
      const { error, backUrl, backUrlAs } = props;
      const messages = Array.isArray(error.errors)
        ? error.errors.map((e, i) =>
            <p key={i}>
              {e.message}
            </p>
          )
        : [error.message ? error.message : error.toString()];

      return (
        <div>
          <SectionHeader>Something’s Wrong!</SectionHeader>
          <p className="m-v500 t--intro">
            We couldn’t save your request because of{' '}
            {messages.length === 1 ? 'this error' : 'these errors'}:
          </p>

          <div className="m-v500 t--info">
            {messages.map((msg, i) =>
              <p key={i}>
                {msg}
              </p>
            )}
          </div>

          <p className="m-v500">
            You can{' '}
            <Link href={backUrl} as={backUrlAs}>
              <a>go back and update your request</a>
            </Link>{' '}
            and try again.
          </p>
        </div>
      );
    }

    default:
      return null;
  }
}
