import { css } from '@emotion/core';

import { MEDIA_MEDIUM } from '@cityofboston/react-fleet';

export const MI_REVIEW_STYLING = css({
  fontSize: '1.35em',

  label: {
    fontWeight: 'bold',
  },
});

export const MAIN_HEADING_STYLING = css({
  fontSize: '2.5rem',
  marginBottom: '1em',
});

export const BOTTOM_SPACING_STYLING = css({
  marginBottom: '0.5em',
});

export const PAIRED_COLUMNS_STYLING = css({
  [MEDIA_MEDIUM]: {
    clear: 'both',
    minHeight: '1px',
    overflow: 'hidden',
    // background: 'yellow',
  },
});

export const COLUMNS_STYLING = css({
  [MEDIA_MEDIUM]: {
    width: '49%',
    float: 'left',
    marginRight: '1%',
    marginBottom: '0.5em',
  },
});

export const COLUMN_ONE_THIRD_STYLING = css({
  width: '32%',
  float: 'left',
  marginRight: '1%',
});

export const COLUMN_TWO_THIRD_STYLING = css({
  width: '65%',
  float: 'left',
  marginRight: '1%',
});

export const COLUMN_ONE_FOURTH_STYLING = css({
  width: '19%',
  float: 'left',
  marginRight: '1%',
});

export const COLUMN_TWO_FOURTH_STYLING = css({
  width: '39%',
  float: 'left',
  marginRight: '1%',
});

export const COLUMN_FOUR_FOURTH_STYLING = css({
  width: '100%',
  clear: 'both',
  minHeight: '100%',
  overflow: 'hidden',
});

export const H3_STYLING = css({
  textTransform: 'uppercase',
  fontSize: '1.3rem',
  fontWeight: 'bold',
  textDecoration: 'underline',
  marginBottom: '0.5em',
});

export const REVIEW_SUB_HEADING_STYLING = css({
  h2: {
    fontSize: '1.25em',
    textDecoration: 'underline',
  },
});

export const REVIEW_BOTTOM_SPACING_STYLING = css({
  marginBottom: '1em',
});

export const ONE_AND_HALF_MARGINBOTTOM = css({
  marginBottom: '1.5em',
});

export const TWO_AND_HALF_MARGINBOTTOM = css({
  marginBottom: '2.5em',
});

export const FLEXGROW_INITIAL_STYLING = css({
  [MEDIA_MEDIUM]: {
    display: 'flex',
    justifyContent: 'flex-start',
    '> div': {
      flexGrow: 'initial',
    },
  },
});

export const ONE_FOURTH_WIDTH_ELEM_INPUT_STYLING = css({
  [MEDIA_MEDIUM]: {
    flexGrow: 'initial',
    width: '20%',
  },
});

export const TWO_FOURTH_WIDTH_ELEM_INPUT_STYLING = css({
  flexGrow: 'initial',
  width: '40%',
});

export const ONE_FOURTH_WIDTH_INPUT_STYLING = css({
  [MEDIA_MEDIUM]: {
    '> div:first-of-type': {
      width: '94%',
    },
  },
});

export const THREE_FOURTH_WIDTH_INPUT_STYLING = css({
  [MEDIA_MEDIUM]: {
    width: '60%',

    '> div:first-of-type': {
      width: '98%',
      display: 'inline-block',
    },
  },
});

export const CLEARED_ROW_STYLING = css({
  [MEDIA_MEDIUM]: {
    clear: 'both',
    minHeight: '1px',
    overflow: 'hidden',

    '> div': {
      width: '50%',
      float: 'left',
    },

    '> div:first-of-type': {
      width: '48%',
      float: 'left',
      marginRight: '2%',
    },
  },
});
