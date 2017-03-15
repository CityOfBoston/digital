// @flow

import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';
import { css } from 'glamor';

import type { AppStore } from '../../../data/store';

import { SMALL_SCREEN, LARGE_SCREEN } from '../../style-constants';

import FormDialog from '../../common/FormDialog';
import DescriptionBox from './DescriptionBox';
import ServiceList from './ServiceList';

export type Props = {
  store: AppStore,
  routeToServiceForm: (code: string) => void,
};

const FORM_STYLE = css({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: 40,
  [SMALL_SCREEN]: {
    flexDirection: 'column',
    marginTop: 20,
  },
});

const BOX_STYLE = css({
  height: 222,
  [LARGE_SCREEN]: {
    width: '75%',
    marginRight: 40,
  },
});

export default observer(function HomeDialog({ store, routeToServiceForm }: Props) {
  return (
    <FormDialog title="311: Boston City Services">
      <Head>
        <title>BOS:311 — Report a Problem</title>
      </Head>

      <div className={FORM_STYLE}>
        <DescriptionBox style={BOX_STYLE} text={store.description} onInput={action((ev) => { store.description = ev.target.value; })} />
        <ServiceList serviceSummaries={store.serviceSummaries} onServiceChosen={routeToServiceForm} />
      </div>
    </FormDialog>
  );
});
