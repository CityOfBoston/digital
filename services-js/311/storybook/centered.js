// @flow

import React, { type Element as ReactElement } from 'react';
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
  children: ReactElement<any> | Array<ReactElement<any>>,
|};

function Centered({ children }: Props) {
  return (
    <div className={CENTERED_STYLE}>
      {children}
    </div>
  );
}

export default function centered(stories: () => ReactElement<any>) {
  return (
    <Centered>
      {stories()}
    </Centered>
  );
}
