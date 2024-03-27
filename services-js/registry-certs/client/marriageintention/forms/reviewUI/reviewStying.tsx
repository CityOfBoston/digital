import { css } from '@emotion/core';
import {
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
  WHITE,
  SANS,
  MEDIA_SMALL_MAX,
  DEFAULT_TEXT,
} from '@cityofboston/react-fleet';

export const REVIEW_INTRO_HEADER_STYLING = css({
  fontSize: '0.9378rem',
  marginBottom: '2em',
  lineHeight: '1.4em',
  color: `${CHARLES_BLUE}`,
  fontFamily: 'Lora',

  H1: {
    fontWeight: 700,
    fontSize: '1.88em',
    textTransform: 'uppercase',
    fontFamily: 'Montserrat !important',
    lineHeight: '1.21em',
    marginBottom: '0em',
  },
});

export const REVIEW_CONTROL_STYLING = css(`
  display: flex;
  overflow: hidden;
  align-items: center;
  align-items: center;
  margin: 1em 0;
  color: #fff;

  .wrapper-title {
    flex-grow: 1;
    
    h1, h2 {
      color: ${CHARLES_BLUE};
      font-size: 1.5625rem;
      font-weight: 700;
      text-transform: uppercase;
      font-family: ${SANS};
      line-height: 1.875em;
    }

    h2 {
      font-size: 1.125rem;
    }
  }

  .wrapper-btn {
    .btn {
      color: ${CHARLES_BLUE};
      background: ${WHITE};
      border: 2px solid ${CHARLES_BLUE};

      &:hover {
        color: ${WHITE};
        background: ${OPTIMISTIC_BLUE_DARK};
      }
    }
  }

  ${MEDIA_SMALL_MAX} {
    .wrapper-title {
      h1 {
        line-height: 1.25em;
      }
    }
  }
`);

export const REVIEW_FORM_STYLING = css(`
  .section-wrapper {
    font-size: 0.9375rem;
    font-family: ${SANS};
    margin-bottom: 1em;

    h2 {
      color: ${CHARLES_BLUE};
      font-size: 1.125rem;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 0.5em;
    }

    .field-value-pair {
      .field {
        color: ${DEFAULT_TEXT};
        font-size: 0.9375rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      .value {
        font-weight: normal;
      }
    }
  }
`);
