/** @jsx jsx */

import { css } from '@emotion/core';
import { CHARLES_BLUE, MEDIA_SMALL_MAX } from '@cityofboston/react-fleet';

export const SECTION_STYLING = css({
  color: 'black',
});

export const SECTIONHEADER_STYLING = css({
  marginBottom: '3em',
});

export const SUBHEADER_STYLING = css({
  color: CHARLES_BLUE,
  fontSize: '20px',
  fontWeight: 'bold',
  fontFamily: 'Montserrat',
  textTransform: 'uppercase',
});

export const INSTRUCTIONS_STYLING = css({
  fontSize: '15px',
  fontFamily: 'Lora',
  color: 'black',
  marginBottom: '1.5em',
});

export const TEXTINPUT_STYLING = css({
  color: 'red',
  '.txt label span.t--req': {
    color: '#fb4d42',
    marginLeft: '1em',
  },
});

// ------------------------------------- //
// Preferred Name Styling

export const PREFERRED_NAME_STYLING = css({
  maxWidth: '694px',
  margin: 'auto',

  color: `${CHARLES_BLUE}`,
  fontFamily: 'Lora',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 'normal',
  lineHeight: 'inherit',

  [MEDIA_SMALL_MAX]: {
    fontSize: '16px',
  },

  '*:focus-visible': {
    outlineColor: '#005EA2',
  },

  'a:link': {
    textDecoration: 'underline',
    color: '##005EA2',

    ':hover': {
      color: '#005EA2',
    },
  },

  'h2, h3': {
    fontFamily: 'Montserrat',
    fontSize: '32px',
    fontStyle: 'normal',
    fontWeight: 'bold',
    lineHeight: 'normal',
    textTransform: 'uppercase',
    padding: '10px',
  },

  '.BorderedAppWrapper': {
    border: '1px solid #A9AEB1',
    borderRadius: '4px', // Matches Figma Design
    borderTop: '0',
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',

    '.btn': {
      borderRadius: '4px',
    },
  },

  '.AddBorderTop': {
    borderColor: '#A9AEB1',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderRadius: '4px', // Matches Figma Design
  },

  '.headerBlock': {
    alignContent: 'center',
    padding: '20px 40px',
    background: '#F0F0F0',
    border: '1px solid #A9AEB1',
    borderRadius: '4px', // Matches Figma Design
    borderBottom: '1px solid #A9AEB1',
    borderBottomLeftRadius: '0',
    borderBottomRightRadius: '0',

    [MEDIA_SMALL_MAX]: {
      paddingLeft: '5px',
      padding: '15px 26px',
      fontSize: '16px',
      marginBottom: '0',
    },

    h3: {
      margin: 0,
      padding: 0,

      [MEDIA_SMALL_MAX]: {
        fontSize: '16px',
      },
    },
  },

  '.AppInnerContainer': {
    'line-height': '1.5rem',

    '.row': {
      padding: '40px',
      paddingBottom: '1rem',

      [MEDIA_SMALL_MAX]: {
        padding: '24px',
      },
    },

    '.bodyText': {
      lineHeight: '1.5rem',
    },
  },

  '.bodyTextLabel': {
    fontWeight: 'bold',
  },
});

// ------------------------ //
// VIEWS //

export const WELCOMEVIEW_STYLING = css({
  padding: '0.5rem 2.5rem 0 2.5rem',

  '@media (max-width: 600px)': {
    padding: '0.25em 0.75em 1em',
  },

  '& > p:first-of-type, ul': {
    borderBottom: '1px solid #ccc',
  },

  '& > p:first-of-type': {
    padding: '0 0 1.5em',
  },

  '& > ul': {
    padding: '0.85em 0 0',
    margin: '0 0 1.25em',

    '& > li': {
      listStyleType: 'disc',
      listStyle: 'outside',
      marginLeft: '1.8em',
    },
  },

  '& > label': {
    fontWeight: 'bold',
  },
});

// ------------------------ //
