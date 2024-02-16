import { css } from '@emotion/core';
import { SANS, CHARLES_BLUE } from '@cityofboston/react-fleet';
import { THICK_BORDER_STYLE } from '../../styling/../../common/question-components/styling';

export const CONTACTFORM_HEADER_STYLING = css(`
  color: ${CHARLES_BLUE};
  font-weight: 700;
  font-size: 1.125em;
  font-family: ${SANS};
  text-transform: uppercase;
  border-bottom: ${THICK_BORDER_STYLE};
  padding-bottom: 0.25em;
`);

export const CONTACTFORM_CONTACT_FIELD_STYLING = css(`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .contact-fields {
    width: calc(50% - 10px); 
    margin-bottom: 10px;
    // background: green;

    label:first-child {
      margin-top: 1em;
    }

    input.txt-f {
      width: 100%;
    }
  }
`);
