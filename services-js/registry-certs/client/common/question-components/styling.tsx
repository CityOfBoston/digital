import { css } from '@emotion/core';

import {
  CHARLES_BLUE,
  FOCUS_INDICATOR_COLOR,
  GRAY_100,
  MEDIA_LARGE,
  MEDIA_MEDIUM,
  MEDIA_SMALL,
  SERIF,
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

      '&:last-of-type': {
        marginLeft: '2rem',
      },
    },
  },
});

export const NOTE_BOX_CLASSNAME = 'm-v500 p-a300 br br-a200 br--r lh--300';
export const SUPPORTING_TEXT_CLASSNAME = 'lh--400 t--s400 m-b500';
