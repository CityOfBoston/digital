import { css } from 'emotion';

import {
  CHARLES_BLUE,
  GRAY_100,
  GREEN,
  MEDIA_MEDIUM,
  MEDIA_SMALL,
  OPTIMISTIC_BLUE,
  SANS,
  SERIF,
  VISUALLYHIDDEN,
} from '@cityofboston/react-fleet';

const WHITE = '#fff';
const BORDER_STYLE = `4px solid ${CHARLES_BLUE}`;

const FOCUS_STYLE = {
  outline: `4px solid ${OPTIMISTIC_BLUE}`,
  outlineOffset: 1,
};

export const SECTION_HEADING_STYLING = css({
  paddingBottom: '0.25rem',
  marginBottom: '0',
  fontFamily: `${SERIF} !important`,
  fontWeight: 700,
  fontSize: '1.5rem',
  color: CHARLES_BLUE,
  borderBottom: BORDER_STYLE,

  '&.secondary': {
    marginBottom: '1rem',
    fontSize: '1.25rem',
    borderWidth: '3px',

    em: {
      fontSize: '1rem',
    },
  },
});

export const SUPPORTING_TEXT_STYLING = css({
  margin: '1.5rem 0 2.5rem',
});

export const RADIOITEM_SHARED_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',

  transition: 'opacity 0.2s',

  input: VISUALLYHIDDEN,

  'input:focus + span': {
    ...FOCUS_STYLE,
  },

  span: {
    marginTop: '1.75rem',
    marginBottom: '2rem',
    padding: '0.8rem 1.5rem',
    fontFamily: SANS,
    fontWeight: 700,
    textTransform: 'uppercase',
    border: BORDER_STYLE,
    whiteSpace: 'nowrap',

    [MEDIA_SMALL]: {
      marginBottom: 0,
    },
  },

  '&.selected': {
    span: {
      backgroundColor: GRAY_100,
    },
  },

  '&.inactive': {
    opacity: 0.25,
  },
});

export const RADIOITEM_STYLING = css({
  color: CHARLES_BLUE,

  svg: {
    width: 100,
    height: 100,
    fill: WHITE,
    stroke: 'currentColor',
    strokeMiterlimit: 10,
    strokeWidth: 3,

    '&.someoneElse': {
      width: 140,
    },

    '&.spouse': {
      ellipse: {
        fill: 'none',
        stroke: WHITE,
        strokeWidth: 8,
      },

      line: {
        strokeLinecap: 'round',
      },
    },

    '&.child': {
      strokeLinejoin: 'round',
      strokeLinecap: 'round',
    },

    '&.heavier': {
      strokeWidth: 3.5,
    },
  },
});

export const ANSWER_ITEM_STYLING = css({
  color: CHARLES_BLUE,
  paddingLeft: '1rem',
  paddingRight: '1rem',
});

export const ANSWER_ICON_STYLING = css({
  width: 80,
  height: 80,
  fill: WHITE,

  ellipse: {
    stroke: 'currentColor',
    strokeWidth: 5,
  },

  '&.checkMark, &.xSymbol': {
    fill: 'none',
    strokeWidth: 7,
    strokeLinecap: 'round',
  },

  '&.checkMark': {
    stroke: GREEN,
  },

  '&.xSymbol': {
    stroke: '#f04f46',
  },

  '&.questionMark': {
    path: {
      fill: CHARLES_BLUE,
      stroke: 'none',
    },
  },
});

export const FIELDSET_STYLING = css({
  margin: 0,
  padding: 0,
  border: 'none',

  legend: {
    paddingLeft: 0,
    width: '100%',
  },

  h2: {
    marginBottom: 0,
    fontFamily: SANS,
    fontWeight: 700,
    color: CHARLES_BLUE,
  },
});

export const RADIOGROUP_STYLING = css({
  margin: '2rem 0 3rem',

  [MEDIA_SMALL]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 0,
  },

  '> *': {
    margin: '1rem',
  },
});

export const QUESTION_CONTAINER_STYLING = css({
  'fieldset + fieldset': {
    marginTop: '4rem',
  },
});

export const HOW_RELATED_CONTAINER_STYLING = css({
  marginTop: '2rem',
  label: {
    marginBottom: '2rem',
  },

  [MEDIA_SMALL]: {
    display: 'flex',
    flexWrap: 'wrap',

    label: {
      flex: '0 1 50%',
      marginBottom: '3rem',
    },
  },

  [MEDIA_MEDIUM]: {
    label: {
      flex: '0 1 33%',
      marginBottom: '4rem',
    },
  },

  // better control of item placement at all device widths, when possible
  // note: the version of js dom used by our version of emotion will throw
  // an error: https://github.com/emotion-js/emotion/issues/604
  '@supports (display: grid)': {
    display: 'grid',

    label: {
      marginBottom: 0,
    },

    [MEDIA_SMALL]: {
      gridTemplateColumns: '1fr 1fr',
      gridRowGap: '4rem',
    },

    [MEDIA_MEDIUM]: {
      gridTemplateColumns: '1fr 1fr 1fr',
    },
  },
});

export const BUTTONS_CONTAINER_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  margin: '3rem 0',

  [MEDIA_SMALL]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button: {
    display: 'block',
    width: '100%',
    marginBottom: '2rem',

    [MEDIA_SMALL]: {
      width: 'auto',
      marginBottom: 0,

      '&:only-of-type': {
        marginLeft: 'auto',
      },
    },
  },
});

export const NAME_FIELDS_CONTAINER_STYLING = css({
  [MEDIA_MEDIUM]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  '> div': {
    textAlign: 'left',

    [MEDIA_MEDIUM]: {
      flexGrow: 1,

      '&:last-of-type': {
        marginLeft: '2rem',
      },
    },
  },
});

// Ensures “next” button comes before “back” on mobile, while maintaining the
// visually-apparent tab order on larger screens.
export const NEXT_BUTTON_STYLE = css({
  border: BORDER_STYLE,
  borderColor: WHITE,

  order: -1,

  [MEDIA_SMALL]: {
    order: 0,
  },

  '&:not(:disabled)': {
    borderColor: CHARLES_BLUE,
  },

  '&:focus': {
    ...FOCUS_STYLE,
  },
});

export const SECONDARY_BUTTON_STYLE = css({
  backgroundColor: WHITE,
  color: OPTIMISTIC_BLUE,
  border: BORDER_STYLE,

  '&:hover': {
    backgroundColor: GRAY_100,
  },

  '&:focus': {
    ...FOCUS_STYLE,
  },
});
