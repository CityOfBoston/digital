import React from 'react';
import { storiesOf } from '@storybook/react';

import { OPTIMISTIC_BLUE_DARK } from '../react-fleet';

import Header from './Header';
import Menu from './Menu';

const render = (headerProps, menuProps) => (
  <>
    <Menu {...menuProps} />
    <div className="mn">
      <Header {...headerProps} />
    </div>
  </>
);

storiesOf('UI|Site Header/Components', module).add('Header', () => <Header />);

storiesOf('UI|Site Header', module)
  .add('default', () => render({}, {}))
  .add('menu open', () => render({}, { open: true }))
  .add('header custom elements', () =>
    render(
      {
        className: 'br br-a300',
        style: { backgroundColor: OPTIMISTIC_BLUE_DARK },
      },
      {}
    )
  );
