/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';
import { observer } from 'mobx-react';

import {
  SECTION_HEADING_STYLING,
  SECTION_WRAPPER_STYLING,
  NAME_FIELDS_BASIC_CONTAINER_STYLING,
} from '../../../common/question-components/styling';

import {
  MAIN_HEADING_STYLING,
  PAIRED_COLUMNS_STYLING,
  COLUMNS_STYLING,
} from '../styling';

interface Props {
  appointmentDateTime: string;
  requestInformation: {
    email: string;
    dayPhone: string;
  };
}

@observer
export default class ContactUX extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const { appointmentDateTime, requestInformation } = this.props;

    return (
      <>
        <h1 css={[SECTION_HEADING_STYLING, MAIN_HEADING_STYLING]}>
          Contact Information
        </h1>

        <div css={SECTION_WRAPPER_STYLING}>
          <div css={PAIRED_COLUMNS_STYLING}>
            <div css={COLUMNS_STYLING}>
              <label>Email: </label>
              {requestInformation.email}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>Phone #: </label>
              {requestInformation.dayPhone}
            </div>
          </div>

          <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
            <label>Appointment Date: </label>
            {appointmentDateTime}
          </div>
        </div>
      </>
    );
  }
}
