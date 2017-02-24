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

function Centered({ children }) {
  return <div className={CENTERED_STYLE}>{ children }</div>;
}

export default function centered(stories: () => mixed) {
  return (
    <Centered>
      { stories() }
    </Centered>
  );
}
