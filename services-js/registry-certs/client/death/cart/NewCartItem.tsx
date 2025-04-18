/** @jsx jsx */

import { css, jsx } from '@emotion/core';

interface Props {
  firstName: string;
  lastName?: string;
}

export const $CartItem = (props: Props) => {
  const { firstName, lastName } = props;
  return (
    <div css={CARTITEM}>
      <label>
        {firstName} {lastName ? lastName : ''}
      </label>
    </div>
  );
};

export default $CartItem;

const CARTITEM = css``;
