// @flow

import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';

import type { AppStore } from '../../../data/store';

import FormDialog from '../../common/FormDialog';
import SectionHeader from '../../common/SectionHeader';
import DescriptionBox from '../../common/DescriptionBox';
import ServiceList from './ServiceList';

export type Props = {
  store: AppStore,
  routeToServiceForm: (code: string) => void,
};

export default observer(function HomeDialog({ store, routeToServiceForm }: Props) {
  return (
    <FormDialog>
      <Head>
        <title>BOS:311 — Report a Problem</title>
      </Head>

      <SectionHeader>311: Boston City Services</SectionHeader>

      <div className="m-v500">
        <div className="g">
          <div className="g--8">
            <h3 className="step m-v300">
              <span className="step-number">1</span>
              What can we do for you?
            </h3>

            <DescriptionBox
              minHeight={222}
              maxHeight={222}
              text={store.description}
              placeholder="How can we help?"
              onInput={action((ev) => { store.description = ev.target.value; })}
            />
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
