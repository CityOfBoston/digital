/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';
import { REVIEW_INTRO_HEADER_STYLING } from './reviewStying';

export default class HeaderUX extends Component {
  public render() {
    return (
      <div css={[REVIEW_INTRO_HEADER_STYLING]}>
        <h1>Review Your Information</h1>

        <p>
          <label>
            Before you submit your application, please check your responses.
          </label>{' '}
          If you need to make any changes, you can go back and edit the previous
          pages. Please make sure your information is accurate. During your
          appointment, we will review and finalize the information you share
          here and make sure everything’s set before it is printed onto your
          marriage intention form.
        </p>
      </div>
    );
  }
}
