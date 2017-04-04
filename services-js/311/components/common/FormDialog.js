// @flow

import React from 'react';
import { css } from 'glamor';

import { MEDIA_LARGE } from '../style-constants';

const DIALOG_STYLE = css({
  display: 'flex-box',
  flexDirection: 'column',
  maxWidth: 1300,
  width: '100%',
  background: 'white',
  position: 'relative',
  transition: 'padding 250ms, max-width 250ms',
  [MEDIA_LARGE]: {
    margin: '80px auto',
  },
});

type Props = {
  narrow?: boolean,
  children?: any
}

export default function FormDialog({ narrow, children }: Props = { narrow: false, children: null }) {
  const style = {};

  if (narrow) {
    style.maxWidth = 800;
  }

  return (
    <div className={`p-a400 br br-t400 br--y ${DIALOG_STYLE.toString()}`} style={style}>
      {children}
    </div>
  );
}
