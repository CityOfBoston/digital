// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from 'mobx';

import type { ServiceSummary } from '../../data/types';
import getStore from '../../data/store';
import page from '../../storybook/page';
import ServicesLayout from './ServicesLayout';

const SERVICE_SUMMARIES: ServiceSummary[] = [{
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  description: 'Something is threatening the fabric of the universe',
  group: 'Health-Safety',
}];

const makeStore = action((expanded: boolean) => {
  const store = getStore();
  (store.allServices.groups.find((g) => g.id === 'Health-Safety') || {}).open = expanded;
  return store;
});

storiesOf('ServicesLayout', module)
  .addDecorator(page)
  .add('Collapsed', () => (
    <ServicesLayout
      store={makeStore(false)}
      services={SERVICE_SUMMARIES}
    />
  ))
  .add('Expanded', () => (
    <ServicesLayout
      store={makeStore(true)}
      services={SERVICE_SUMMARIES}
    />
  ))
;
