import React from 'react';
import { storiesOf } from '@storybook/react';
import TranslateDialog from './TranslateDialog';

storiesOf('TranslateDialog', module)
  .addDecorator(next => <div className="b-c">{next()}</div>)
  .add('dialog', () => (
    <TranslateDialog
      languages={[
        { code: 'en', region: 'US', quality: 1 },
        { code: 'en', region: null, quality: 0.8 },
      ]}
    />
  ));
