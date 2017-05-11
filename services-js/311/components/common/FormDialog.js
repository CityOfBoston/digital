// @flow

import React from 'react';
import { css } from 'glamor';

import { MEDIA_LARGE } from '../style-constants';

export const MAX_WIDTH = 1300;

const DIALOG_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: MAX_WIDTH,
  width: '100%',
  background: 'white',
  position: 'relative',
  transition: 'max-width 250ms',
  minHeight: 'calc(100vh - 119px)',
  [MEDIA_LARGE]: {
    margin: '2rem auto',
    minHeight: 'auto',
  },
});

type Props = {|
  narrow?: boolean,
  popup?: boolean,
  noPadding?: boolean,
  children?: any
|}

export default function FormDialog({ narrow, noPadding, children }: Props = { narrow: false, noPadding: false, children: null }) {
  const style = {};

  if (narrow) {
    style.maxWidth = 800;
  }

  const paddingClasses = noPadding ? '' : 'p-a300 p-a800--xl';

  return (
    <div className={`${paddingClasses} br br-t400 br--y ${DIALOG_STYLE.toString()}`} style={style}>
      {children}
    </div>
  );
}
