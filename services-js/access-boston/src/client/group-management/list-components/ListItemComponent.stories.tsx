import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';

import { Person } from '../types';

import ListItemComponent from './ListItemComponent';

const person: Person = {
  cn: '010',
  distinguishedName: '',
  displayName: 'Bob Roberts',
  name: '',
  status: 'current',
  givenName: 'Bob',
  sn: 'Roberts',
  groups: [],
  action: '',
};

function Wrapper(props) {
  const [checked, setChecked] = useState<boolean>(true);

  return (
    <ListItemComponent
      view="management"
      item={{ ...person, ...props }}
      handleChange={() => setChecked(!checked)}
      isChecked={checked}
      viewOnly={false}
    />
  );
}

storiesOf('GroupManagementPage/ListComponents/ListItemComponent', module)
  .add('default', () => <Wrapper isAvailable={true} />)
  .add('no link', () => (
    <ListItemComponent item={person} view="review" viewOnly={false} />
  ))
  .add('not modifiable', () => <Wrapper isAvailable={false} />)
  .add('newly added', () => <Wrapper isAvailable={true} status="add" />);
