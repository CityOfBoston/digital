// @flow

import React from 'react';
import { css } from 'glamor';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import Head from 'next/head';

import type { AppStore } from '../../../data/store';

import { MEDIA_LARGE } from '../../style-constants';
import FormDialog from '../../common/FormDialog';
import SectionHeader from '../../common/SectionHeader';
import DescriptionBox from '../../common/DescriptionBox';
import ServiceList from './ServiceList';

export type Props = {
  store: AppStore,
  routeToServiceForm: (code: ?string) => void,
  // eslint-disable-next-line react/no-unused-prop-types
  stage: 'home' | 'service',
};

const DESCRIPTION_HEADER_STYLE = css({
  display: 'none',
  [MEDIA_LARGE]: {
    display: 'block',
  },
});

const NEXT_BUTTON_STYLE = css({
  width: '100%',
  [MEDIA_LARGE]: {
    display: 'none',
  },
});

const SERVICE_PICKER_STYLE = css({
  display: 'none',
  [MEDIA_LARGE]: {
    display: 'block',
  },
});

function renderHome({ store, routeToServiceForm }: Props) {
  return (
    <FormDialog>
      <Head>
        <title>BOS:311 — Report a Problem</title>
      </Head>

      <SectionHeader>311: Boston City Services</SectionHeader>

      <div className="m-v500">
        <div className="g">
          <div className="g--8">
            <h3 className={`stp m-v300 ${DESCRIPTION_HEADER_STYLE.toString()}`}>
              <span className="stp-number">1</span>
              What can we do for you?
            </h3>

            <DescriptionBox
              minHeight={222}
              maxHeight={222}
              text={store.requestForm.description}
              placeholder="How can we help?"
              onInput={action((ev) => { store.requestForm.description = ev.target.value; })}
            />
          </div>

          <div className={`g--44 ${SERVICE_PICKER_STYLE.toString()}`}>
            <h3 className="stp m-v300">Top Service Requests</h3>
            <div style={{ height: 222, overflowY: 'scroll' }}>
              <ServiceList serviceSummaries={store.serviceSummaries} onServiceChosen={routeToServiceForm} />
            </div>
          </div>
        </div>

      </div>

      <button className={`btn ${NEXT_BUTTON_STYLE.toString()}`} onClick={() => { routeToServiceForm(); }}>Next</button>
    </FormDialog>
  );
}

function renderServicePicker({ store, routeToServiceForm }: Props) {
  return (
    <FormDialog>
      <Head>
        <title>BOS:311 — Report a Problem</title>
      </Head>

      <SectionHeader>311: Boston City Services</SectionHeader>

      <div className="m-v500">
        <div className="t--intro">Pick the most related:</div>
        <div style={{ height: 222, overflowY: 'scroll' }}>
          <ServiceList serviceSummaries={store.serviceSummaries} onServiceChosen={routeToServiceForm} />
        </div>
      </div>
    </FormDialog>
  );
}

export default observer(function HomeDialog(props: Props) {
  const { stage } = props;
  switch (stage) {
    case 'home': return renderHome(props);
    case 'service': return renderServicePicker(props);
    default: return null;
  }
});
