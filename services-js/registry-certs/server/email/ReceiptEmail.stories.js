// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';

import SNAPSHOTS from './__snapshots__/ReceiptEmail.test.js.snap';

function snapToString(name: string) {
  return JSON.parse(SNAPSHOTS[name].trim().replace(/\n/g, '\\n'));
}

storiesOf('ReceiptEmail', module)
  .add('HTML', () => (
    <div
      dangerouslySetInnerHTML={{
        __html: snapToString('it renders an HTML body 1'),
      }}
    />
  ))
  .add('text', () => <pre>{snapToString('it renders a text body 1')}</pre>);
