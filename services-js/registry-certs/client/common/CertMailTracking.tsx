/** @jsx jsx */
import { jsx, css } from '@emotion/core';
// import React from 'react';

import { AddRemoveRadioBtn } from '@cityofboston/react-fleet';

interface Props {
  action: 'add' | 'remove';
  value: 0 | 1;
  onClickHandler: () => void;
}

export const CertMailTracking = (props: Props): JSX.Element => {
  const { action, value, onClickHandler } = props;

  return (
    <div css={TRACKING_STYLING}>
      <label>Need A Tracking Number?</label>

      <AddRemoveRadioBtn
        labels={['Add', 'Remove']}
        name={`CC_AddRemove`}
        id={`checkoutAddRemove`}
        action={action}
        value={value}
        onClickHandler={onClickHandler}
      />
    </div>
  );
};

export default CertMailTracking;

const TRACKING_STYLING = css`
  font-family: SERIF;
`;
