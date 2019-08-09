/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';
import YesNoUnsureComponent from '../../common/question-components/YesNoUnsureComponent';

import {
  SECTION_HEADING_STYLING,
  NOTE_BOX_CLASSNAME,
} from '../../common/question-components/styling';

interface Props {
  marriageCertificateRequest: MarriageCertificateRequest;

  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
  handleUserReset: (ev: MouseEvent) => void;
}

/**
 * This question determines whether or not the Registry would have the record.
 *
 * If NO is selected, the user cannot proceed.
 *
 * If UNKNOWN is selected, the user will progress to the next question.
 */
@observer
export default class FiledInBoston extends Component<Props> {
  public static isComplete(
    marriageCertificateRequest: MarriageCertificateRequest
  ): boolean {
    const {
      requestInformation: { filedInBoston },
    } = marriageCertificateRequest;

    return !!filedInBoston;
  }

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { marriageCertificateRequest } = this.props;

    marriageCertificateRequest.answerQuestion({
      [event.target.name]: event.currentTarget.value,
    });
  };

  public render() {
    const { marriageCertificateRequest } = this.props;
    const {
      requestInformation: { forSelf, filedInBoston },
      mightNotHaveRecord,
      definitelyDontHaveRecord,
    } = marriageCertificateRequest;

    return (
      <QuestionComponent
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        handleReset={this.props.handleUserReset}
        allowProceed={FiledInBoston.isComplete(marriageCertificateRequest)}
        startOver={definitelyDontHaveRecord}
      >
        <>
          <FieldsetComponent
            legendText={
              <h2 id="filedInBoston" css={SECTION_HEADING_STYLING}>
                Was {forSelf ? 'your' : 'their'} marriage license filed at
                Boston City Hall?
              </h2>
            }
          >
            <p>
              This refers to where the paperwork was filed, <em>not</em> where
              the marriage took place.
            </p>

            <YesNoUnsureComponent
              questionName="filedInBoston"
              questionValue={filedInBoston}
              handleChange={this.handleChange}
            />
          </FieldsetComponent>

          {(definitelyDontHaveRecord || mightNotHaveRecord) && (
            <div className={NOTE_BOX_CLASSNAME} style={{ paddingBottom: 0 }}>
              <h2 className="h3 tt-u">
                {definitelyDontHaveRecord &&
                  `Sorry, we don’t have ${forSelf ? 'your' : 'their'} record`}
                {mightNotHaveRecord &&
                  `We might not have ${forSelf ? 'your' : 'their'} record`}
              </h2>

              <p>
                We only have records for marriages filed at Boston City Hall.
                It’s possible to have a wedding in Boston with a marriage
                license issued by any city or town in Massachusetts.
              </p>

              {definitelyDontHaveRecord && (
                <p>
                  Please contact the town, city, state, or country where{' '}
                  {forSelf ? 'your' : 'their'} marriage was filed to find the
                  record.
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
