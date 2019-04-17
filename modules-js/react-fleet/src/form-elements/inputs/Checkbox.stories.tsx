import React from 'react';
import { storiesOf } from '@storybook/react';
import Checkbox from './Checkbox';

storiesOf('Form Elements|Inputs/Checkbox', module).add('Checkbox', () => (
  <>
    <Checkbox name="checkbox" value="checkbox" checked={true}>
      Community Preservation Committee
    </Checkbox>
    <br />
    <Checkbox name="checkbox" value="checkbox" checked={true}>
      Community Preservation Committee
      <br />
      <a href="#" title="Homepage" target="_blank">
        Homepage
      </a>
    </Checkbox>
  </>
));
