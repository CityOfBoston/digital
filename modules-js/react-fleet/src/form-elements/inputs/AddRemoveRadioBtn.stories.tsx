import React from 'react';
// import React, { useState } from 'react';

import { storiesOf } from '@storybook/react';
import { NarrowWrapper } from '@cityofboston/storybook-common';
import { withKnobs } from '@storybook/addon-knobs';

import AddRemoveRadioBtn from './AddRemoveRadioBtn';

const clickHandler = (key: number = 0): void => {
  console.log(`Step Click: #${key}`);
};

storiesOf('Form Elements | Checkout / Add-Remove', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .addDecorator(withKnobs)
  .add('variants', () => (
    <>
      <h4>State: Disabled</h4>
      <AddRemoveRadioBtn
        labels={['Add', 'Remove']}
        name={`CC_AddRemove`}
        id={`checkoutAddRemove`}
        state={`disabled`}
        action={`add`}
        value={0}
        onClickHandler={clickHandler}
      />

      <br />

      <h4>State: Enabled (default)</h4>
      <AddRemoveRadioBtn
        labels={['Add', 'Remove']}
        name={`CC_AddRemove`}
        id={`checkoutAddRemove`}
        action={`add`}
        value={0}
        onClickHandler={clickHandler}
      />

      <br />

      <h4>Action: Focused</h4>
      <AddRemoveRadioBtn
        labels={['Add', 'Remove']}
        name={`CC_AddRemove`}
        id={`checkoutAddRemove`}
        state={`focused`}
        action={`add`}
        value={0}
        onClickHandler={clickHandler}
      />

      <br />

      <h4>Action: Remove</h4>
      <AddRemoveRadioBtn
        labels={['Add', 'Remove']}
        name={`CC_AddRemove`}
        id={`checkoutAddRemove`}
        state={`default`}
        action={`remove`}
        value={1}
        onClickHandler={clickHandler}
      />
    </>
  ));
