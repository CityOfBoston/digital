import React from 'react';
import { storiesOf } from '@storybook/react';

import { ScreenReaderSupport } from '@cityofboston/next-client-common';

import AddressSearch from '../../../data/store/AddressSearch';
import BrowserLocation from '../../../data/store/BrowserLocation';
import Ui from '../../../data/store/Ui';
import RequestSearch from '../../../data/store/RequestSearch';

import RequestDialog from './RequestDialog';

storiesOf('RequestDialog', module).add('404 - Service Not Found', () => (
  <RequestDialog
    addressSearch={new AddressSearch()}
    browserLocation={new BrowserLocation()}
    requestSearch={new RequestSearch()}
    screenReaderSupport={new ScreenReaderSupport()}
    ui={new Ui()}
    service={null}
    serviceCode="NOTHERE"
    description=""
    stage="questions"
    fetchGraphql={null as any}
    routeToServiceForm={null as any}
    setLocationMapActive={() => {}}
  />
));
