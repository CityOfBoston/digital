// @flow

import React from 'react';
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
  children: React.Element<*> | Array<React.Element<*>>,
|};

function Centered({ children }: Props) {
  return (
    <div className={CENTERED_STYLE}>
      {children}
    </div>
  );
}

export default function centered(stories: () => React.Element<*>) {
  return (
    <Centered>
      {stories()}
    </Centered>
  );
}
