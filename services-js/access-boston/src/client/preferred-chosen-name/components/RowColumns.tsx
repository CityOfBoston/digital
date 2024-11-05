/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { ChosenNameTag, EmailAddressTag } from './TagComponent';

export default function RowColumns({
  chosenName,
  emailAddress,
}: {
  chosenName: string;
  emailAddress: string;
}) {
  return (
    <div css={INDEX_CONTAINER_STYLING}>
      <div css={INDEX_ITEM_STYLING}>
        <ChosenNameTag/>
        <div css={VALUE_STYLING}>{chosenName}</div>
      </div>
      <div css={INDEX_ITEM_STYLING}>
        <EmailAddressTag/>
        <div css={VALUE_STYLING}>{emailAddress}</div>
      </div>
    </div>
  );
}

const INDEX_CONTAINER_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
});

const INDEX_ITEM_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #ccc',
  padding: '24px 56px 24px 56px',

  '@media (max-width: 600px)': {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '16px 20px'
  },
});

const VALUE_STYLING = css({
  textAlign: 'right',
  margin: 0,
  wordWrap: 'break-word',
  flex: '1',
  whiteSpace: 'normal',
  overflow: 'hidden',
  overflowWrap: 'break-word',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '@media (max-width: 600px)': {
    textAlign: 'left',
    justifyContent: 'flex-start',
    width: '100%',
    paddingTop: '8px'
  },
});