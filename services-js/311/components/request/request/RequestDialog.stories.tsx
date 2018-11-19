import React from 'react';
import { storiesOf } from '@storybook/react';

import { AppStore } from '../../../data/store';

import RequestDialog from './RequestDialog';

storiesOf('RequestDialog', module).add('404 - Service Not Found', () => (
  <RequestDialog
    store={new AppStore()}
    service={null}
    serviceCode="NOTHERE"
    description=""
    stage="questions"
    fetchGraphql={null as any}
    routeToServiceForm={null as any}
    setLocationMapActive={() => {}}
  />
));
