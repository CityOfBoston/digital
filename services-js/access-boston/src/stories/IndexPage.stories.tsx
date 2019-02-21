import React from 'react';
import { storiesOf } from '@storybook/react';

import IndexPage, { FlashMessage } from '../pages/index';
import { Account, Apps } from '../client/graphql/fetch-account-and-apps';
import { makeAppsRegistry } from '../lib/AppsRegistry';

// @ts-ignore
import APPS_YAML from '../../fixtures/apps.yaml';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
  firstName: 'Jyn',
  lastName: 'Doe',
  registered: true,
  needsMfaDevice: false,
  needsNewPassword: false,
  resetPasswordToken: '',
};

const appsRegistry = makeAppsRegistry(APPS_YAML, true);

const APPS: Apps = {
  categories: appsRegistry.appsForGroups([]).map(cat => ({
    title: cat.title,
    showIcons: cat.icons,
    requestAccessUrl: cat.showRequestAccessLink ? '#' : null,
    apps: cat.apps,
  })),
};

storiesOf('IndexPage', module)
  .add('default', () => <IndexPage account={ACCOUNT} apps={APPS} />)
  .add('change password success', () => (
    <IndexPage
      account={ACCOUNT}
      apps={APPS}
      flashMessage={FlashMessage.CHANGE_PASSWORD_SUCCESS}
    />
  ));
