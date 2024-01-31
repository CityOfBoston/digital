/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';

import { SECTION_HEADING_STYLING } from '../../../common/question-components/styling';

import { MAIN_HEADING_STYLING } from '../styling';

export default class HeaderUX extends Component {
  public render() {
    return (
      <>
        <p>
          Please review the details below. If you notice any errors, click the
          "back" button at the bottom of your screen and correct your
          information before submitting this application.
        </p>

        <h1 css={[SECTION_HEADING_STYLING, MAIN_HEADING_STYLING]}>
          Review Information
        </h1>
      </>
    );
  }
}
