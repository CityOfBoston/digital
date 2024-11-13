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
  flexDirection: 'column',
  alignItems: 'flex-start',  
  borderBottom: '1px solid #ccc',
  padding: '24px 40px',

  '@media (max-width: 600px)': {
    padding: '16px 20px'
  },
});

const VALUE_STYLING = css({
  textAlign: 'left',
  flex: '1',
  whiteSpace: 'normal',
  wordBreak: 'break-all',
  overflowWrap: 'break-word',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  paddingTop: '8px',
  paddingLeft: "50px",
  '@media (max-width: 600px)': {
    paddingLeft: "0px",
  },
});