// @flow

import React from 'react';
import { css } from 'glamor';
import SectionHeader from '../../common/SectionHeader';
import LoadingBuildings from '../../common/LoadingBuildings';
import type Ui from '../../../data/store/Ui';

export type Props = {|
  state: 'submitting',
  ui: Ui,
|} | {|
  state: 'error',
  error: Object,
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

          <div className="t--intro m-v500">Please wait while we save your request.</div>

          <div className={`m-v500 p-a500 ${LOADING_CONTAINER_STYLE.toString()}`}>
            <LoadingBuildings reduceMotion={props.ui.reduceMotion} />
          </div>
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

    default:
      return null;
  }
}
