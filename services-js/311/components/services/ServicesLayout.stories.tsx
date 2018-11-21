import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from 'mobx';

import { ServiceSummary } from '../../data/types';
import AllServices from '../../data/store/AllServices';
import page from '../../.storybook/page';
import ServicesLayout from './ServicesLayout';

const SERVICE_SUMMARIES: ServiceSummary[] = [
  {
    name: 'Cosmic Incursion',
    code: 'CSMCINC',
    description: 'Something is threatening the fabric of the universe',
    group: 'health-safety',
  },
];

const makeAllServices = action((expanded: boolean) => {
  const allServices = new AllServices();
  allServices.groups.find(g => g.id === 'Health-Safety')!.open = expanded;
  return allServices;
});

storiesOf('ServicesLayout', module)
  .addDecorator(page)
  .add('Collapsed', () => (
    <ServicesLayout
      allServices={makeAllServices(false)}
      services={SERVICE_SUMMARIES}
    />
  ))
  .add('Expanded', () => (
    <ServicesLayout
      allServices={makeAllServices(true)}
      services={SERVICE_SUMMARIES}
    />
  ));
