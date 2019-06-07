/** @jsx jsx */

import { jsx } from '@emotion/core';

import {
  // ChangeEvent,
  Component,
  MouseEvent,
  // ReactChild
} from 'react';
import { observer } from 'mobx-react';

import { MemorableDateInput } from '@cityofboston/react-fleet';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';

import {
  // SUPPORTING_TEXT_CLASSNAME,
  SECTION_HEADING_STYLING,
  // NOTE_BOX_CLASSNAME,
} from '../../common/question-components/styling';

const EARLIEST_DATE = new Date(Date.UTC(1870, 0, 1));

interface Props {
  marriageCertificateRequest: MarriageCertificateRequest;
  showRecentBirthWarning?: boolean;

  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
}

@observer
export default class DateOfMarriage extends Component<Props> {
  public static isComplete({
    requestInformation,
  }: MarriageCertificateRequest): boolean {
    return !!requestInformation.dateOfMarriageStart;
  }

  private handleDateChange = (newDate: Date | null): void => {
    this.props.marriageCertificateRequest.answerQuestion({
      dateOfMarriageStart: newDate,
    });
  };

  public render() {
    const { marriageCertificateRequest } = this.props;
    const {
      dateOfMarriageStart,
    } = marriageCertificateRequest.requestInformation;

    return (
      <QuestionComponent
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        allowProceed={DateOfMarriage.isComplete(marriageCertificateRequest)}
      >
        <div className="m-v700">
          <MemorableDateInput
            legend={
              <h2
                css={SECTION_HEADING_STYLING}
                style={{ marginBottom: '1.5rem' }}
              >
                What was the date of the marriage?
              </h2>
            }
            initialDate={dateOfMarriageStart || undefined}
            componentId="dateOfMarriageStart"
            onlyAllowPast={true}
            earliestDate={EARLIEST_DATE}
            handleDate={this.handleDateChange}
          />
        </div>
      </QuestionComponent>
    );
  }

  // private renderRecentBirthWarningText(): ReactChild {
  //   return (
  //     <div className={NOTE_BOX_CLASSNAME} style={{ paddingBottom: 0 }}>
  //       <h2 className="h3 tt-u">
  //         We might not have the marriage certificate yet
  //       </h2>
  //
  //       <p>
  //         <strong>
  //           We recommend waiting at least two weeks before you request a
  //           marriage certificate.
  //         </strong>{' '}
  //         It generally takes two weeks for us to receive paperwork from the
  //         hospital.
  //       </p>
  //
  //       <p>
  //         If you order too early, we can only hold your request for seven days
  //         while we wait for the hospital record. If we don’t receive the record
  //         in time, your request will be canceled automatically and your card
  //         will not be charged. You’ll have to resubmit your request.
  //       </p>
  //     </div>
  //   );
  // }
}

// function isDateWithinPastThreeWeeks(date: Date): boolean {
//   const dayInMs = 8.64e7;
//   const threeWeeksAgo = new Date(Date.now() - 21 * dayInMs);
//
//   return threeWeeksAgo < date;
// }
