import React from 'react';
import { storiesOf } from '@storybook/react';

import SectionHeader from './SectionHeader';

storiesOf('Content Sections|SectionHeader', module)
  .add('default', () => <SectionHeader title="Boards and Commissions" />)
  .add('yellow', () => <SectionHeader title="Boards and Commissions" yellow />)
  .add('subheader', () => (
    <SectionHeader title="Boards and Commissions" subheader />
  ));
