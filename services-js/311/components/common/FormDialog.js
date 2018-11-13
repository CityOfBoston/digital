// @flow

import React from 'react';
import { css } from 'emotion';

import { MEDIA_LARGE, HEADER_HEIGHT, CLEAR_FIX } from '../style-constants';

export const MAX_WIDTH = 1300;

const DIALOG_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: MAX_WIDTH,
  width: '100%',
  background: 'white',
  position: 'relative',
  transition: 'max-width 250ms',
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  [MEDIA_LARGE]: {
    margin: '2rem auto',
    minHeight: 'auto',
  },
  ...CLEAR_FIX,
});

type Props = {|
  narrow?: boolean,
  noPadding?: boolean,
  children?: any,
  style?: { [key: string]: string },
|};

export default function FormDialog(
  { narrow, noPadding, children, style }: Props = {
    narrow: false,
    noPadding: false,
    children: null,
    style: {},
  }
) {
  const combinedStyle = { ...style };

  if (narrow) {
    combinedStyle.maxWidth = 800;
  }

  const paddingClasses = noPadding ? '' : 'p-a300 p-a800--xl';

  return (
    <div
      className={`${paddingClasses} br br-t400 br--y ${DIALOG_STYLE.toString()}`}
      style={combinedStyle}
    >
      {children}
    </div>
  );
}
