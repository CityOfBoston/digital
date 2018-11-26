import { css } from 'emotion';

import {
  CHARLES_BLUE,
  FREEDOM_RED,
  GRAY_300,
  OPTIMISTIC_BLUE,
  SANS,
} from '@cityofboston/react-fleet';

// Apply to <ul/ol> to remove default list styles
export const CLEAR_LIST_STYLING = css({
  listStyle: 'none',
  marginTop: 0,
  marginBottom: 0,
  paddingLeft: 0,
});

// https://www.w3.org/WAI/tutorials/forms/labels/#note-on-hiding-elements
const VISUALLY_HIDDEN = css({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  width: '1px',
});

const UNBORDERED_STYLING = {
  display: 'flex',
  justifyContent: 'center',
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
  input: VISUALLY_HIDDEN,
  'input:focus + label': {
    outline: `5px auto ${GRAY_300}`,
    outlineOffset: 2,
  },
  'input:checked + label': {
    color: '#fff',
    backgroundColor: OPTIMISTIC_BLUE,
  },
};

const BORDER_STYLE = `2px solid ${CHARLES_BLUE}`;

export const RADIOGROUP_STYLING = css({
  ...UNBORDERED_STYLING,
  '> *': {
    borderLeft: BORDER_STYLE,
    borderTop: BORDER_STYLE,
    borderBottom: BORDER_STYLE,
  },
  '> *:last-of-type': {
    borderRight: BORDER_STYLE,
  },
});

export const RADIOGROUP_UNBORDERED_STYLING = css(UNBORDERED_STYLING);

export const NAME_FIELDS_CONTAINER_STYLING = css({
  display: 'flex',
  justifyContent: 'space-between',
  marginLeft: 'auto',
  marginRight: 'auto',

  '> div': {
    flexGrow: 1,
    textAlign: 'left',
    '&:last-of-type': {
      marginLeft: '2rem',
    },
  },
});
