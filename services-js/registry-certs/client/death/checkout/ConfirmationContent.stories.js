// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';

import appLayoutDecorator from '../../../storybook/app-layout-decorator';

import ConfirmationContent from './ConfirmationContent';

storiesOf('ConfirmationContent', module)
  .addDecorator(appLayoutDecorator(true))
  .add('default', () => (
    <ConfirmationContent
      orderId="123-4444-5"
      contactEmail="ttoe@squirrelzone.net"
    />
  ));
