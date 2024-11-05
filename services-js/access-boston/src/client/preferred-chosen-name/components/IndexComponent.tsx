/** @jsx jsx */
import { css, jsx } from '@emotion/core';

export default function IndexComponent({
  data,
}: {
  data: Record<string, string>;
}) {
  return (
    <div css={INDEX_CONTAINER_STYLING}>
      {Object.entries(data).map(([key, value]) => (
        <div css={INDEX_ITEM_STYLING} key={key}>
          <label css={KEY_STYLING}>{key}</label>
          <p css={VALUE_STYLING}>{value}</p>
        </div>
      ))}
    </div>
  );
}

const INDEX_CONTAINER_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0px',
});

const INDEX_ITEM_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #ccc',
  padding: '32px 56px 18px 56px',
});

const KEY_STYLING = css({
  textTransform: 'uppercase',
  fontFamily: 'Montserrat',
  fontWeight: 'bolder',
  textAlign: 'left',
  margin: 0,
  flex: '0 1 auto',
  minWidth: "200px",
});

const VALUE_STYLING = css({
  textAlign: 'right',
  margin: 0,
  width: '25px',
  wordWrap: 'break-word',
  flex: '1',
  whiteSpace: 'normal',
  overflow: 'hidden',
  overflowWrap: 'break-word',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});
