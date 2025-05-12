/** @jsx jsx */

import { css, jsx } from '@emotion/core';

export type CertItemProps = {
  type: 'birth' | 'marriage' | 'death';
  quantity: number;
  showNameLabel: boolean;
  pending?: boolean;
  subinfo?: string;
  firstName?: string;
  lastName?: string;
  fullNames?: string;
};

export const CertItem = (cert: CertItemProps) => {
  const { type, fullNames = '' } = cert;

  return (
    <div css={CERTITEM_CSS}>
      <div>
        <label>Type: </label>
        <span>{type}</span>
      </div>
      {type === 'marriage' && fullNames.length > 0 && (
        <div>
          <label>Name: </label>
          <span>[{fullNames}]</span>
        </div>
      )}
    </div>
  );
};

export default CertItem;

const CERTITEM_CSS = css``;
