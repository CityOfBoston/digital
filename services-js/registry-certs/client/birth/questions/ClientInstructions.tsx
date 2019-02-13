import React from 'react';

import QuestionComponent from '../components/QuestionComponent';

import { SECTION_HEADING_STYLING } from '../styling';

interface Props {
  handleStepBack: () => void;
}

export default class ClientInstructions extends React.Component<Props> {
  public render() {
    return (
      <QuestionComponent
        handleStepBack={this.props.handleStepBack}
        allowProceed={false}
      >
        {this.renderRestrictedText()}
      </QuestionComponent>
    );
  }

  private renderRestrictedText(): React.ReactChild {
    return (
      <div className="m-t500">
        <h2 className={SECTION_HEADING_STYLING}>
          You must complete this process in person or by mail
        </h2>

        <div className="lh--300">
          <p>
            If you are a legal representative making a request for a client, you
            need these items to get a record:
          </p>

          <ol>
            <li>
              A letter on letterhead stating you legally represent the person
              for whom you are requesting a record
            </li>
            <li>
              A photocopy of your ID (state-issued ID, driver’s license, or
              government-issued ID), and
            </li>

            <li>
              A copy of your BAR card (must be in good standing and not expired)
            </li>
          </ol>

          <p>
            You must complete this process in person at Boston City Hall or by
            mail. In person, the cost per request is $12. We take cash, credit
            or debit cards, checks, or money orders. By mail, the cost per
            request is $14. We accept checks or money orders payable to the City
            of Boston.
          </p>

          <p>
            You can find more information online at{' '}
            <strong>
              <a href="https://www.boston.gov/birth">boston.gov/birth</a>
            </strong>
          </p>

          <p>
            <strong className="t--sans tt-u">Please note:</strong> If you are a
            legal representative and making a mail request, we will only return
            the record to your address.
          </p>
        </div>
      </div>
    );
  }
}
