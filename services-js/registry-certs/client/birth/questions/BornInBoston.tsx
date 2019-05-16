/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';
import YesNoUnsureComponent from '../../common/question-components/YesNoUnsureComponent';

import {
  SECTION_HEADING_STYLING,
  NOTE_BOX_CLASSNAME,
} from '../../common/question-components/styling';

interface Props {
  birthCertificateRequest: BirthCertificateRequest;

  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
  handleUserReset: (ev: MouseEvent) => void;
}

/**
 * This question determines whether or not the Registry would have the record.
 *
 * If the user selects NO or UNKNOWN for bornInBoston, the follow-up question
 * parentsLivedInBoston is asked.
 *
 * If NO is selected for both questions, the user cannot proceed.
 *
 * If UNKNOWN is selected for either of the two questions, the user will
 * progress to the next question.
 */
@observer
export default class BornInBoston extends Component<Props> {
  public static isComplete(
    birthCertificateRequest: BirthCertificateRequest
  ): boolean {
    const {
      mightNotHaveRecord,
      requestInformation: { bornInBoston, parentsLivedInBoston },
    } = birthCertificateRequest;

    return (
      bornInBoston === 'yes' ||
      parentsLivedInBoston === 'yes' ||
      mightNotHaveRecord
    );
  }

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { birthCertificateRequest } = this.props;
    birthCertificateRequest.answerQuestion({
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  public render() {
    const { birthCertificateRequest } = this.props;
    const {
      requestInformation: { forSelf, bornInBoston, parentsLivedInBoston },
      mightNotHaveRecord,
      definitelyDontHaveRecord,
    } = birthCertificateRequest;

    const askForParents = bornInBoston && bornInBoston !== 'yes';

    return (
      <QuestionComponent
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        handleReset={this.props.handleUserReset}
        allowProceed={BornInBoston.isComplete(birthCertificateRequest)}
        startOver={definitelyDontHaveRecord}
      >
        <>
          <FieldsetComponent
            legendText={
              <h2 id="bornInBoston" css={SECTION_HEADING_STYLING}>
                Were {forSelf ? 'you' : 'they'} born in Boston?
              </h2>
            }
          >
            <YesNoUnsureComponent
              questionName="bornInBoston"
              questionValue={bornInBoston}
              handleChange={this.handleChange}
            />
          </FieldsetComponent>

          {askForParents && (
            <FieldsetComponent
              legendText={
                <h3 id="parentsLivedInBoston" css={SECTION_HEADING_STYLING}>
                  Did {forSelf ? 'your' : 'their'} parents live in Boston at the
                  time of {forSelf ? 'your' : 'their'} birth?
                </h3>
              }
            >
              <YesNoUnsureComponent
                questionName="parentsLivedInBoston"
                questionValue={parentsLivedInBoston || ''}
                handleChange={this.handleChange}
              />
            </FieldsetComponent>
          )}

          {(definitelyDontHaveRecord || mightNotHaveRecord) && (
            <div className={NOTE_BOX_CLASSNAME} style={{ paddingBottom: 0 }}>
              <h2 className="h3 tt-u">
                {definitelyDontHaveRecord &&
                  `Sorry, we don’t have ${forSelf ? 'your' : 'their'} record`}
                {mightNotHaveRecord &&
                  `We might not have ${forSelf ? 'your' : 'their'} record`}
              </h2>

              <p>
                We only have records for people born in the City of Boston, or
                people whose parents were married and living in Boston at the
                time of the birth.
              </p>

              {definitelyDontHaveRecord && (
                <p>
                  Please contact the town, city, state, or country where{' '}
                  {forSelf ? 'you' : 'they'} were born to find the record.
                </p>
              )}

              {mightNotHaveRecord && (
                <p>
                  You can still place this order, and we’ll do our best to help
                  you out.
                </p>
              )}
            </div>
          )}
        </>
      </QuestionComponent>
    );
  }
}
