import { css } from '@emotion/core';

// https://www.w3.org/WAI/tutorials/forms/labels/#note-on-hiding-elements
export const VISUALLY_HIDDEN = css({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  width: '1px',
});

export const CLEAR_DEFAULT_STYLING = {
  BUTTON: css({
    backgroundColor: 'transparent',
    color: 'inherit',
    border: 'none',
    margin: 0,
    padding: 0,
    overflow: 'visible',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    textAlign: 'inherit',
  }),
  INPUT_NUMBER: css({
    input: {
      MozAppearance: 'textfield',

      '&::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
      },

      '&::-ms-clear': {
        display: 'none',
      },
    },
  }),
};
