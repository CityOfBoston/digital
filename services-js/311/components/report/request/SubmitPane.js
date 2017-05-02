// @flow

import React from 'react';
import { css } from 'glamor';
import SectionHeader from '../../common/SectionHeader';
import LoadingBuildings from '../../common/LoadingBuildings';

export type Props = {|
  state: 'submitting',
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
          <div className={`m-v500 p-a500 ${LOADING_CONTAINER_STYLE.toString()}`}>
            <LoadingBuildings />
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
