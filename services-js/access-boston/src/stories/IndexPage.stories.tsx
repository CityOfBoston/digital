import React from 'react';
import { storiesOf } from '@storybook/react';

import IndexPage, { FlashMessage } from '../pages/index';
import { Account, Apps } from '../client/graphql/fetch-account-and-apps';
import { makeAppsRegistry } from '../lib/AppsRegistry';

// @ts-ignore
import APPS_YAML from '../../fixtures/apps.yaml';
import { NoticeClass } from '../lib/AppsRegistry';

const noticeBanner1 = new NoticeClass({
  label: 'Confirm your Mailing Address',
  pretext: 'PRETEXT',
  copy: `Click the ESS tile to confirm that your mailing address is correct & to go paperless for your W2, ACA and paystubs.
Tax documents will be available in January. Make your Access Boston account even more secure by setting up the PingID app. It is faster and easier to use than getting codes via text, email or phone! Directions are [here](https://www.boston.gov/access-boston-portal-help#pingid-app-instructions)`,
  alert: true,
});

console.log('noticeBanner1: ', noticeBanner1);

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
  cobAgency: 'CH',
};

const appsRegistry = makeAppsRegistry(APPS_YAML, true);

const APPS: Apps = {
  categories: appsRegistry.appsForGroups([], true, 'CH').map(cat => ({
    title: cat.title,
    showIcons: cat.icons,
    requestAccessUrl: cat.showRequestAccessLink ? '#' : null,
    apps: cat.apps,
  })),
};

storiesOf('IndexPage', module)
  .add('default', () => (
    <IndexPage
      account={ACCOUNT}
      apps={APPS}
      daysUntilMfa={null}
      notice={new NoticeClass({})}
    />
  ))

  .add('Notice Banner', () => (
    <IndexPage
      account={ACCOUNT}
      apps={APPS}
      daysUntilMfa={null}
      notice={{
        label: 'Confirm your Mailing Address',
        pretext: 'PRETEXT',
        copy: ``,
        alert: true,
      }}
    />
  ))

  .add('change password success', () => (
    <IndexPage
      account={ACCOUNT}
      apps={APPS}
      flashMessage={FlashMessage.CHANGE_PASSWORD_SUCCESS}
      daysUntilMfa={null}
      notice={new NoticeClass({})}
    />
  ))

  .add('hasn’t registered MFA', () => (
    <IndexPage
      account={{
        ...ACCOUNT,
        hasMfaDevice: false,
      }}
      apps={APPS}
      daysUntilMfa={28}
      notice={new NoticeClass({})}
    />
  ));
