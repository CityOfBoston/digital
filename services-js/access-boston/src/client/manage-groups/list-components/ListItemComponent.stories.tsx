import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';

import { Person } from '../types';

import ListItemComponent from './ListItemComponent';

const person: Person = {
  displayName: 'Bob Roberts',
  cn: '010',
  status: 'current',
  givenName: 'Bob',
  sn: 'Roberts',
  mail: 'bob.roberts@boton.gov',
  groups: [],
};

function Wrapper(props) {
  const [checked, setChecked] = useState<boolean>(true);

  return (
    <ListItemComponent
      item={{ ...person, ...props }}
      handleChange={() => setChecked(!checked)}
      isChecked={checked}
    />
  );
}

storiesOf('ManageGroupsPage/ListComponents/ListItemComponent', module)
  .add('default', () => <Wrapper isAvailable={true} />)
  .add('no link', () => <ListItemComponent item={person} />)
  .add('not modifiable', () => <Wrapper isAvailable={false} />);
