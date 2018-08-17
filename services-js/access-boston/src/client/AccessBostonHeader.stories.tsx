import React from 'react';
import { storiesOf } from '@storybook/react';

import AccessBostonHeader from './AccessBostonHeader';
import { Account } from './graphql/fetch-account';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
};

storiesOf('AccessBostonHeader', module).add('default', () => (
  <AccessBostonHeader account={ACCOUNT} />
));
