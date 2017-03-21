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
  transition: 'padding 250ms',
  [SMALL_SCREEN]: {
    borderTop: 'none',
    padding: 20,
    margin: 0,
  },
});

export default function FormDialog({ small, children }) {
  return (
    <div className={`br br-t400 br--y ${DIALOG_STYLE}`} style={{ padding: small ? 20 : 40 }}>
      {children}
    </div>
  );
}
