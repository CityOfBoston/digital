// @flow

import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';
import { css } from 'glamor';

import type { AppStore } from '../../../data/store';

import FormDialog from '../../common/FormDialog';
import DescriptionBox from './DescriptionBox';
import ServiceList from './ServiceList';

export type Props = {
  store: AppStore,
  routeToServiceForm: (code: string) => void,
};

const BOX_STYLE = css({
  height: 222,
});

export default observer(function HomeDialog({ store, routeToServiceForm }: Props) {
  return (
    <FormDialog title="311: Boston City Services">
      <Head>
        <title>BOS:311 — Report a Problem</title>
      </Head>

      <div className="m-v500">
        <div className="g">
          <div className="g--8">
            <h3 className="step m-v300">
              <span className="step-number">1</span>
            What can we do for you?
          </h3>
            <DescriptionBox style={BOX_STYLE} text={store.description} onInput={action((ev) => { store.description = ev.target.value; })} />
          </div>

          <div className="g--44">
            <h3 className="step m-v300">Top Service Requests</h3>
            <ServiceList serviceSummaries={store.serviceSummaries} onServiceChosen={routeToServiceForm} />
          </div>
        </div>
      </div>
    </FormDialog>
  );
});
