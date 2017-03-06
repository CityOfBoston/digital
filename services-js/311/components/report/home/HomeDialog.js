// @flow

import React from 'react';
import Head from 'next/head';
import { css } from 'glamor';

import type { ServiceSummary } from '../../../data/types';

import FormDialog from '../../common/FormDialog';
import DescriptionBox from './DescriptionBox';
import ServiceList from './ServiceList';

type ExternalProps = {
  serviceSummaries: ServiceSummary[],
  routeToServiceForm: (code: string) => void,
}

export type ValueProps = {
  requestDescription: string,
};

export type ActionProps = {
  setRequestDescription: (description: string) => void,
};

export type Props = ExternalProps & ValueProps & ActionProps;

const FORM_STYLE = css({
  display: 'flex',
  alignItems: 'flex-start',
});

export default function ReportHomeDialog({ requestDescription, serviceSummaries, setRequestDescription, routeToServiceForm }: Props) {
  return (
    <FormDialog title="311: Boston City Services">
      <Head>
        <title>BOS:311 — Report a Problem</title>
      </Head>

      <div className={FORM_STYLE}>
        <DescriptionBox text={requestDescription} onInput={(ev) => { setRequestDescription(ev.target.value); }} />
        <ServiceList serviceSummaries={serviceSummaries} onServiceChosen={routeToServiceForm} />
      </div>
    </FormDialog>
  );
}
