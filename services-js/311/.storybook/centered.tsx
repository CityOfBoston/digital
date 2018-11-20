import React, { ReactNode } from 'react';
import { css } from 'emotion';

const CENTERED_STYLE = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  position: 'absolute',
  width: '100%',
  height: '100%',
});

type Props = {
  children: ReactNode;
};

function Centered({ children }: Props) {
  return <div className={CENTERED_STYLE}>{children}</div>;
}

export default function centered(stories: () => ReactNode) {
  return <Centered>{stories()}</Centered>;
}
