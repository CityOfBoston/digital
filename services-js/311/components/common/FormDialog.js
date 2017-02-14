import React from 'react';
import { css } from 'glamor';

import SectionHeader from './SectionHeader';

const STYLE = {
  dialog: css({
    borderTop: '5px solid yellow',
    display: 'flex-box',
    flexDirection: 'column',
    width: 900,
    background: 'white',
    margin: '80px auto 0',
    padding: 40,
    position: 'relative',
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
