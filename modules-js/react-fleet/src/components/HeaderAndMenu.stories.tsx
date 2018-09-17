import React from 'react';
import { storiesOf } from '@storybook/react';

import Header from './Header';
import Menu from './Menu';

import { OPTIMISTIC_BLUE } from '../react-fleet';

const render = (headerProps, menuProps) => (
  <>
    <Menu {...menuProps} />
    <div className="mn">
      <Header {...headerProps} />
    </div>
  </>
);

storiesOf('Components/Header and Menu', module)
  .add('default', () => render({}, {}))
  .add('menu open', () => render({}, { open: true }))
  .add('header custom elements', () =>
    render(
      { className: 'br br-a300', style: { backgroundColor: OPTIMISTIC_BLUE } },
      {}
    )
  );
