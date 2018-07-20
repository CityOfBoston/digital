import React from 'react';
import { storiesOf } from '@storybook/react';

import IndexPage from '../pages/index';
import { InfoResponse } from '../lib/api';

const INFO: InfoResponse = {
  name: 'CON01234',
};

storiesOf('IndexPage', module).add('default', () => <IndexPage info={INFO} />);
