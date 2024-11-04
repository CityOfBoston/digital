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
          <p css={KEY_STYLING}>{key}</p>
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
  padding: '10px 56px',
});

const KEY_STYLING = css({
  fontSize: '16px',
  fontWeight: 'bolder',
  textAlign: 'left',
  margin: 0,
  flex: '0 1 auto',
});

const VALUE_STYLING = css({
  fontSize: '16px',
  textAlign: 'right',
  margin: 0,
  flex: '1 1 auto',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});
