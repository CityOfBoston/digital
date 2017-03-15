import React from 'react';
import { css } from 'glamor';

import { SMALL_SCREEN } from '../style-constants';

import SectionHeader from './SectionHeader';

const STYLE = {
  dialog: css({
    borderTop: '.444444rem solid #fcb61a',
    display: 'flex-box',
    flexDirection: 'column',
    maxWidth: 900,
    background: 'white',
    margin: '80px auto 80px',
    padding: 40,
    position: 'relative',
    [SMALL_SCREEN]: {
      borderTop: 'none',
      padding: 20,
      margin: 0,
    },
  }),
};

export default function FormDialog({ title, children }) {
  return (
    <div className={STYLE.dialog}>
      { title && <SectionHeader>{title}</SectionHeader> }
      {children}
    </div>
  );
}
