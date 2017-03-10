// @flow

import React from 'react';
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
      const { submittedRequest: { id, status } } = props;
      return (
        <div>
          <SectionHeader>Success!</SectionHeader>
          <div><b>ID:</b> { id }</div>
          <div><b>Status:</b> { status }</div>
        </div>
      );
    }

    default:
      return null;
  }
}
