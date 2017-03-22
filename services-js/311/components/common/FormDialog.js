import React from 'react';
import { css } from 'glamor';

import { SMALL_SCREEN } from '../style-constants';

const DIALOG_STYLE = css({
  display: 'flex-box',
  flexDirection: 'column',
  maxWidth: 1300,
  width: '100%',
  background: 'white',
  margin: '80px auto 80px',
  position: 'relative',
  transition: 'padding 250ms, max-width 250ms',
  padding: '70px 80px',
  [SMALL_SCREEN]: {
    borderTop: 'none',
    padding: 20,
    margin: 0,
  },
});

export default function FormDialog({ small, narrow, children }) {
  const style = {};

  if (small) {
    style.padding = 20;
  }

  if (narrow) {
    style.maxWidth = 800;
  }

  return (
    <div className={`br br-t400 br--y ${DIALOG_STYLE}`} style={style}>
      {children}
    </div>
  );
}
