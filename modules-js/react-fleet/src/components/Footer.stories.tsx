import React from 'react';
import { storiesOf } from '@storybook/react';

import Footer from './Footer';
import { GRAY_100 } from '../react-fleet';

storiesOf('Components/Footer', module)
  .add('default', () => <Footer />)
  .add('custom attributes', () => (
    <Footer className="br br-a300" style={{ backgroundColor: GRAY_100 }} />
  ));
