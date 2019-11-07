import React from 'react';
import { storiesOf } from '@storybook/react';

import GroupManagement from '../pages/group-management';

import { Account } from '../client/graphql/fetch-account';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
  firstName: 'Jyn',
  lastName: 'Doe',
  needsMfaDevice: false,
  needsNewPassword: false,
  hasMfaDevice: true,
  resetPasswordToken: '',
  mfaRequiredDate: '2019-03-19T15:49:37.758Z',
  groups: [''],
  email: 'jondoe@boston.gov',
};

storiesOf('GroupManagementPage', module).add('default', () => (
  <GroupManagement account={ACCOUNT} />
));
//   .add('view group', () => <ManageGroupsPage account={ACCOUNT} />)
//   .add('view member', () => <ManageGroupsPage account={ACCOUNT} />);
