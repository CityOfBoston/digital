/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';
import { observer } from 'mobx-react';

import { REVIEW_FORM_STYLING } from './reviewStying';
import { formatPhoneNumber } from '../../helpers/formUtils';
import { $ReviewControlHeader, $ReviewFieldValuePair } from './components';

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
      <div>
        {$ReviewControlHeader({
          title: `Contact Information`,
          btnStr: `Edit This Page`,
          routeStep: `contactInfo`,
        })}

        <div css={REVIEW_FORM_STYLING}>
          <div className="section-wrapper">
            <h2>Personal Information</h2>

            {$ReviewFieldValuePair({
              field: `Email`,
              value: `${requestInformation.email}`,
            })}

            {$ReviewFieldValuePair({
              field: `Phone #`,
              value: `${formatPhoneNumber(requestInformation.dayPhone)}`,
            })}

            {$ReviewFieldValuePair({
              field: `Appointment Date`,
              value: `${appointmentDateTime}`,
            })}
          </div>
        </div>
      </div>
    );
  }
}
