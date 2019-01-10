import React from 'react';
import { css } from 'emotion';
import { format } from 'date-fns';

type Props = {
  lastUpdated: Date | null;
};

const LAST_UPDATED_STYLE = css`
  color: #e8e8e8;
  margin-left: auto;
  font-style: italic;
`;

export default function LastUpdated({
  lastUpdated,
}: Props): React.ReactElement<any> {
  //January 7, 2019 1:51PM
  const lastUpdatedString = lastUpdated
    ? `Last updated: ${format(lastUpdated, 'MMMM D, YYYY h:mmA')}`
    : 'Loading…';

  return <div className={LAST_UPDATED_STYLE}>{lastUpdatedString} </div>;
}
