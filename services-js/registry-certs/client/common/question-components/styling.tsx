import { css } from '@emotion/core';

import {
  CHARLES_BLUE,
  FOCUS_INDICATOR_COLOR,
  GRAY_100,
  MEDIA_LARGE,
  MEDIA_MEDIUM,
  MEDIA_SMALL,
  SERIF,
  SANS,
} from '@cityofboston/react-fleet';

export const THICK_BORDER_STYLE = `4px solid ${CHARLES_BLUE}`;
export const THIN_BORDER_STYLE = `1px solid ${GRAY_100}`;

export const FOCUS_STYLE = css({
  outline: `4px solid ${FOCUS_INDICATOR_COLOR}`,
  outlineOffset: 1,
});

export const SECTION_HEADING_STYLING = css({
  paddingBottom: '0.25rem',
  marginBottom: '0',
  fontFamily: `${SERIF} !important`,
  fontWeight: 700,
  fontSize: '1.5rem',
  color: CHARLES_BLUE,
  borderBottom: THICK_BORDER_STYLE,

  '&.secondary': {
    marginBottom: '1rem',
    fontSize: '1.25rem',
    borderWidth: '3px',

    em: {
      fontSize: '1rem',
    },
  },
});

export const MARGIN_TOP_STYLING = css({
  marginTop: '2em',
});

export const PADDING_TOP_STYLING = css({
  paddingTop: '2em',
});

export const DISCLAIMER_STYLING = css({
  'ol li': {
    paddingBottom: '0.7em',
  },
});

export const RADIOGROUP_STYLING = css({
  margin: '2rem 0 3rem',

  [MEDIA_MEDIUM]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 0,
  },
  [MEDIA_LARGE]: {
    '> *': {
      margin: '1rem',
    },
  },
});

export const HOW_RELATED_CONTAINER_STYLING = css({
  marginTop: '2rem',

  label: {
    alignItems: 'flex-end',
    marginBottom: '2rem',
  },

  [MEDIA_SMALL]: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',

    label: {
      flex: '0 1 50%',
      alignItems: 'center',
      marginBottom: '3rem',

      '&:last-of-type': {
        span: {
          whiteSpace: 'nowrap',
        },
      },
    },
  },

  [MEDIA_MEDIUM]: {
    label: {
      flex: '0 1 32%',
    },
  },

  [MEDIA_LARGE]: {
    label: {
      marginBottom: '4rem',
    },
  },

  '&.birth': {
    // better control of item placement at all device widths, when possible
    // note: the version of js dom used by our version of emotion will throw
    // an error: https://github.com/emotion-js/emotion/issues/604
    '@supports (display: grid)': {
      display: 'grid',
      gridRowGap: '2rem',

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

      // '&:last-of-type': {
      //   marginLeft: '2rem',
      // },
    },
  },
});

export const NAME_FIELDS_BASIC_CONTAINER_STYLING = css({
  [MEDIA_MEDIUM]: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  '> div': {
    textAlign: 'left',

    [MEDIA_MEDIUM]: {
      flexGrow: 1,
    },
  },

  '> .RADIOGROUP': {
    label: {
      display: 'block',
    },
  },

  h3: {
    fontFamily: `${SANS} !important`,
    fontWeight: 700,
    fontSize: '1rem',
  },

  '.notice': {
    fontSize: '0.7em',

    clear: 'both',
    minHeight: '1px',
    overflow: 'hidden',
    display: 'block',
    margin: '1% 0 1.5%',
    lineHeight: '1.5em',
  },

  '.css-content-psedo': {
    '&:after': {
      content: "'&nbsp;'",
      opacity: 0,
    },
  },
});

export const RADIOGROUP_CONTAINER_STYLING = css({
  flexDirection: 'column',
  paddingTop: '1em',

  '> label': {
    display: 'flex',
    marginLeft: 0,
    marginBottom: '1em',
  },

  [MEDIA_MEDIUM]: {
    '.cb': {
      margin: 0,
      marginLeft: 0,
      marginBottom: '1em',
    },

    '.cb:not(:first-of-type)': {
      marginLeft: 0,
    },
  },
});

export const HEADER_SPACING_STYLING = css({
  marginTop: '1em',
});

export const HEADER_SPACING_2_STYLING = css({
  marginTop: '2em',
});

export const SECTION_WRAPPER_STYLING = css({
  marginBottom: '2.5em',
});

export const HEADER_PADDING_TOP_STYLING = css({
  paddingBottom: '2em',
});

export const BOTTOM_SPACING_STYLING = css({
  marginBottom: '2.5em',
});

export const PAIRED_INPUT_STYLING = css({
  [MEDIA_MEDIUM]: {
    '> div': {
      width: '50%',
    },

    '.txt-f': {
      width: '90%',
    },
  },
});

export const MARRIAGE_INTENTION_FORM_STYLING = css({
  h2: {
    fontSize: '1.5rem',
  },

  h4: {
    fontSize: '1.25rem',
  },
});

export const MARRIAGE_INTENTION_INTRO_STYLING = css({
  fontSize: '1.5em',
  lineHeight: '1.5em',
  marginTop: '1em',
});

export const MARRIAGE_INTENTION_INTRO_BODY_STYLING = css({
  lineHeight: '1.25em',
});

export const EVEN_FIELD_LEN_CONTAINER_STYLING = css({
  '.txt-f': {
    width: '90%',
  },
});

export const WIDTH_ONE_THIRD_STYLING = css({
  '> div:first-of-type .txt-f': {
    width: '30%',
  },
  '> div:first-of-type label': {
    width: '30%',
  },
});

export const OVERRIDE_SELECT_DISPLAY_STYLING = css({
  '.sel-c': {
    display: 'block',
  },
});

export const NOTE_BOX_CLASSNAME = 'm-v500 p-a300 br br-a200 br--r lh--300';
export const SUPPORTING_TEXT_CLASSNAME = 'lh--400 t--s400 m-b500';
