import { css } from 'emotion';

import {
  CHARLES_BLUE,
  FREEDOM_RED,
  GRAY_100,
  GRAY_300,
  MEDIA_SMALL,
  OPTIMISTIC_BLUE,
  SANS,
  VISUALLYHIDDEN,
} from '@cityofboston/react-fleet';

// Apply to <ul/ol> to remove default list styles
export const CLEAR_LIST_STYLING = css({
  listStyle: 'none',
  marginTop: 0,
  marginBottom: 0,
  paddingLeft: 0,
});

const UNBORDERED_STYLING = {
  label: {
    display: 'block',
    padding: '1rem 2rem',
    cursor: 'pointer',
    color: CHARLES_BLUE,
    fontFamily: SANS,
    fontWeight: 700,
    'text-transform': 'uppercase',
    '&:hover': {
      color: FREEDOM_RED,
    },
  },
  input: VISUALLYHIDDEN,
  'input:focus + label': {
    outline: `5px auto ${GRAY_300}`,
    outlineOffset: 2,
  },
  'input:checked + label': {
    color: '#fff',
    backgroundColor: OPTIMISTIC_BLUE,
  },
  [MEDIA_SMALL]: {
    display: 'flex',
    justifyContent: 'center',
  },
};

const BORDER_STYLE = `2px solid ${CHARLES_BLUE}`;

export const RADIOGROUP_STYLING = css({
  ...UNBORDERED_STYLING,
  '> *': {
    border: BORDER_STYLE,
    marginBottom: '2rem',

    [MEDIA_SMALL]: {
      marginBottom: 0,
      '&:not(:last-of-type)': {
        borderRight: 'none',
      },
    },
  },
});

export const RADIOGROUP_UNBORDERED_STYLING = css(UNBORDERED_STYLING);

export const NAME_FIELDS_CONTAINER_STYLING = css({
  [MEDIA_SMALL]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  '> div': {
    textAlign: 'left',

    [MEDIA_SMALL]: {
      flexGrow: 1,
      '&:last-of-type': {
        marginLeft: '2rem',
      },
    },
  },
});

export const SECONDARY_BUTTON_STYLE = css({
  backgroundColor: '#fff',
  color: OPTIMISTIC_BLUE,
  border: '3px solid currentColor',
  '&:hover': {
    borderColor: CHARLES_BLUE,
  },
});

export const BUTTONS_CONTAINER_STYLING = css({
  marginTop: '3rem',
  [MEDIA_SMALL]: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    display: 'block',
    width: '100%',
    marginBottom: '2rem',
    [MEDIA_SMALL]: {
      width: 'auto',
      marginBottom: 0,
      marginLeft: '2rem',
    },
  },
});

export const PROGRESS_BAR_STYLE = css({
  marginTop: '2em',
  width: '100%',
  height: '0.5em',
  border: 'none',
  backgroundColor: GRAY_100,
  '::-webkit-progress-bar': {
    backgroundColor: GRAY_100,
  },
  '::-webkit-progress-value': {
    backgroundColor: OPTIMISTIC_BLUE,
  },
  '::-moz-progress-bar': {
    backgroundColor: OPTIMISTIC_BLUE,
  },
  '::-ms-fill': {
    backgroundColor: OPTIMISTIC_BLUE,
  },
});
