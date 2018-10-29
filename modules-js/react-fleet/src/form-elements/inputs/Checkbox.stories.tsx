import React from 'react';
import { storiesOf } from '@storybook/react';
import Checkbox from './Checkbox';

storiesOf('Form Elements/Inputs', module)
  .add('Checkbox / text title', () => (
    <Checkbox
      name="checkbox"
      title="Community Preservation Committee"
      value="checkbox"
      onChange={() => {}}
      onBlur={() => {}}
      checked={true}
    />
  ))
  .add('Checkbox / div passed in', () => (
    <Checkbox
      name="commissionIds"
      value={'commissionCheckbox'}
      title={
        <div className={`cb-l`}>
          <span>South End Landmark District Commission</span>
          <br />
          <a href="#" title="Homepage" target="_blank">
            Homepage
          </a>
        </div>
      }
      onChange={() => {}}
      checked={false}
    />
  ));
