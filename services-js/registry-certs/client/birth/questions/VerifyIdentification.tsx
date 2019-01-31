import React from 'react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';

import VerifyIdentificationComponent from '../VerifyIdentificationComponent';
import QuestionComponent from './QuestionComponent';
import RadioItemComponent from '../RadioItemComponent';
import AnswerIcon from '../icons/AnswerIcon';
import CertificateIcon from '../icons/CertificateIcon';

import {
  ANSWER_ITEM_STYLING,
  SECTION_HEADING_STYLING,
  RADIOGROUP_STYLING,
} from '../styling';

interface Props {
  birthCertificateRequest: BirthCertificateRequest;
  handleProceed: () => void;
  handleStepBack: () => void;
}

interface State {
  hasId: 'yes' | 'no' | '';
}

export default class VerifyIdentification extends React.Component<
  Props,
  State
> {
  state: State = {
    hasId: '',
  };

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      hasId: event.target.value as any,
    });
  };

  private requestHelp = (): void => {
    //  todo
  };

  public render() {
    const noId = this.state.hasId === 'no';

    return (
      <QuestionComponent
        handleProceed={
          noId ? this.requestHelp : () => this.props.handleProceed()
        }
        handleStepBack={this.props.handleStepBack}
        allowProceed={this.state.hasId.length > 0}
        nextButtonText={noId ? 'Request help' : 'Review request'}
      >
        <>
          <h2 className={SECTION_HEADING_STYLING}>Verify your identity</h2>

          {this.state.hasId === 'yes' ? (
            <VerifyIdentificationComponent />
          ) : (
            <>
              {noId ? (
                <p className="m-b700" style={{ minHeight: '30vh' }}>
                  No ID? We can help explain your options.
                </p>
              ) : (
                <>
                  <p>
                    Since the record you’re ordering may have an access
                    restriction, you must upload a valid form of identification
                    (i.e. driver’s license, state ID, military ID, or passport)
                    before we can process your request.
                  </p>
                  <p>
                    <em>Please note</em>: You must be a person or parent listed
                    on the record in order to get a copy of the record. If you
                    are not listed on the record, you will not be able to get a
                    copy. Your request will be canceled and your card will not
                    be charged. Contact <strong>registry@boston.gov</strong>{' '}
                    with questions.
                  </p>

                  <h3>We accept the following forms of ID:</h3>
                  <ul>
                    <li>Driver’s License</li>
                    <li>State ID</li>
                    <li>Passport</li>
                    <li>Military ID</li>
                  </ul>

                  <div role="radiogroup" className={RADIOGROUP_STYLING}>
                    <RadioItemComponent
                      questionName="hasId"
                      questionValue={this.state.hasId}
                      itemValue="yes"
                      labelText="Upload ID"
                      handleChange={this.handleChange}
                      className={ANSWER_ITEM_STYLING}
                    >
                      <CertificateIcon name="id" />
                    </RadioItemComponent>

                    <RadioItemComponent
                      questionName="hasId"
                      questionValue={this.state.hasId}
                      itemValue="no"
                      labelText="No ID?"
                      handleChange={this.handleChange}
                      className={ANSWER_ITEM_STYLING}
                    >
                      <AnswerIcon iconName="xSymbol" />
                    </RadioItemComponent>
                  </div>
                </>
              )}
            </>
          )}
        </>
      </QuestionComponent>
    );
  }
}
