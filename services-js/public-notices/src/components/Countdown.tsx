import React from 'react';
import { css } from 'emotion';
import Timer from '../model/Timer';
import { observer } from 'mobx-react';
import { format } from 'date-fns';

type Props = {
  timer: Timer;
};

const COUNTDOWN_CONTAINER_STYLE = css`
  padding-top: 0.875rem;
  display: flex;
  flex-direction: row;
`;

const VIEW_STYLE = css`
  margin-left: auto;
  padding-right: 0.65rem;
`;

export default observer(function Countdown({
  timer: { running, secondsLeft },
}: Props): React.ReactElement<any> {
  return (
    <div className={COUNTDOWN_CONTAINER_STYLE}>
      <div>
        {running && (
          <div>
            Next page in{' '}
            <strong>{format(new Date(1000 * secondsLeft), 'm:ss')}</strong>
          </div>
        )}
      </div>

      <div className={VIEW_STYLE}>
        View all public notices at <strong>boston.gov/public-notices</strong>
      </div>
    </div>
  );
});
