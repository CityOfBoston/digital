// @flow

import React from 'react';
import { css } from 'glamor';

import { MEDIA_LARGE } from '../style-constants';

export const MAX_WIDTH = 1300;

const DIALOG_STYLE = css({
  display: 'flex-box',
  flexDirection: 'column',
  maxWidth: MAX_WIDTH,
  width: '100%',
  background: 'white',
  position: 'relative',
  transition: 'max-width 250ms',
  [MEDIA_LARGE]: {
    margin: '2rem auto',
  },
});

type Props = {|
  narrow?: boolean,
  popup?: boolean,
  noPadding?: boolean,
  children?: any
|}

export default function FormDialog({ narrow, popup, noPadding, children }: Props = { popup: false, narrow: false, noPadding: false, children: null }) {
  const style = {};

  if (narrow) {
    style.maxWidth = 800;
  }

  const paddingClasses = noPadding ? '' : `p-a300 ${!popup ? 'p-a800--xl' : ''}`;

  return (
    <div className={`${paddingClasses} br br-t400 br--y ${DIALOG_STYLE.toString()}`} style={style}>
      {children}
    </div>
  );
}
