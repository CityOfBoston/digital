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
  color: 'black',
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
  display: 'plex',
  maxWidth: '694px',
  margin: 'auto',

  color: `${CHARLES_BLUE}`,
  fontFamily: 'Lora',
  fontSize: '22px',
  fontStyle: 'normal',
  fontWeight: 'normal',
  lineHeight: '150%',

  [MEDIA_SMALL_MAX]: {
    fontSize: '16px',
  },

  'h2, h3': {
    fontFamily: 'Montserrat',
    fontSize: '32px',
    fontStyle: 'normal',
    fontWeight: 'bold',
    lineHeight: 'normal',
    textTransform: 'uppercase',
    padding: '10px',
    margin: '0 0 27px 0',
  },

  '.BorderedAppWrapper': {
    display: 'plex',

    border: '1px solid #A9AEB1',
    borderRadius: '4px',

    '.btn': {
      borderRadius: '4px',
    },
  },

  '.AppInnerContainer': {
    display: 'plex',

    '.headerBlock': {
      display: 'plex',
      alignContent: 'center',
      padding: '30px 10px 30px 49px',
      background: '#F0F0F0',
      borderBottom: '1px solid #A9AEB1',

      [MEDIA_SMALL_MAX]: {
        paddingLeft: '26px ',
        fontSize: '12px',
      },

      h3: {
        margin: 0,
        padding: 0,

        [MEDIA_SMALL_MAX]: {
          fontSize: '16px',
        },
      },
    },

    '.row': {
      padding: '60px',
      paddingBottom: '1rem',

      [MEDIA_SMALL_MAX]: {
        padding: '24 px',
      },
    },

    '.bodyText': {
      lineHeight: '2rem',
    },
  },

  '.bodyTextLabel': {
    fontWeight: 'bold',
  },
});
