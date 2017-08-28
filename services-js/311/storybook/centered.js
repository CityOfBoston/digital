// @flow

import * as React from 'react';
import { css } from 'glamor';

const CENTERED_STYLE = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  position: 'absolute',
  width: '100%',
  height: '100%',
});

type Props = {|
  children: React.Element<any> | Array<React.Element<any>>,
|};

function Centered({ children }: Props) {
  return (
    <div className={CENTERED_STYLE}>
      {children}
    </div>
  );
}

export default function centered(stories: () => React.Element<any>) {
  return (
    <Centered>
      {stories()}
    </Centered>
  );
}
