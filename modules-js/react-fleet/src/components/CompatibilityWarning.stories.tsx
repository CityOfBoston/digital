import React from 'react';
import { storiesOf } from '@storybook/react';
import { CompatibilityWarningContent, Message } from './CompatibilityWarning';

storiesOf('Components/CompatibilityWarning', module)
  .add('no script', () => (
    <CompatibilityWarningContent message={Message.NO_SCRIPT} />
  ))
  .add('old browser', () => (
    <CompatibilityWarningContent message={Message.OLD_BROWSER} />
  ));
