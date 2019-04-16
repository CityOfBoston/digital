import React from 'react';
import { storiesOf } from '@storybook/react';

import { GRAY_100 } from '../react-fleet';

import Footer from './Footer';

storiesOf('UI|Footer', module)
  .add('default', () => <Footer />)
  .add('custom attributes', () => (
    <Footer className="br br-a300" style={{ backgroundColor: GRAY_100 }} />
  ));
