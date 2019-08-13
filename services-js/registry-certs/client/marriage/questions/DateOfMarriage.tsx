/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component, MouseEvent, ReactChild } from 'react';
import { observer } from 'mobx-react';

import { MemorableDateInput } from '@cityofboston/react-fleet';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';

import {
  SECTION_HEADING_STYLING,
  NOTE_BOX_CLASSNAME,
  RADIOGROUP_STYLING,
} from '../../common/question-components/styling';

import { RADIOITEM_STYLING } from '../../common/question-components/YesNoUnsureComponent';
import RadioItemComponent from '../../common/question-components/RadioItemComponent';
import DateRangePicker from '../../common/DateRangePicker';
import AnswerIcon from '../../common/icons/AnswerIcon';

const EARLIEST_DATE = new Date(Date.UTC(1870, 0, 1));

type KnowsExact = 'yes' | 'no' | null;

interface Props {
  marriageCertificateRequest: MarriageCertificateRequest;
  showRecentBirthWarning?: boolean;

  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
}

interface State {
  knowsExact: KnowsExact;
  isRangeInvalid: boolean;
}

/**
 * If the user knows the exact date of marriage, displays <MemorableDatePicker>
 * control. Otherwise, display <DateRangePicker>.
 *
 * If the user selects “yes” and inputs a date within ten days prior, a
 * “date too recent” warning will be displayed.
 *
 * If the user changes their yes/no answer, any partial or full date value
 * will be discarded. The user should never be able to input values for both
 * dateOfMarriageExact and dateOfMarriageUnsure at the same time.
 *
 * For testing purposes, dateOfMarriageUnsure = “00/0000 - 00/0000” is treated
 * as if no date has been provided.
 */
@observer
export default class DateOfMarriage extends Component<Props, State> {
  constructor(props) {
    super(props);

    const setKnowsExact = (): KnowsExact => {
      if (
        props.marriageCertificateRequest.requestInformation.dateOfMarriageExact
      ) {
        return 'yes';
      } else if (
        props.marriageCertificateRequest.requestInformation.dateOfMarriageUnsure
          .length > 0
      ) {
        return 'no';
      }

      return null;
    };

    // If a date has been passed down OR already exists in the
    // requestInformation, assign a value for knowsExact. Otherwise,
    // knowsExact should be null to hide the date input from view until
    // the user makes a selection.
    this.state = {
      knowsExact: setKnowsExact(),
      isRangeInvalid: false,
    };
  }

  public static isComplete({
    requestInformation,
  }: MarriageCertificateRequest): boolean {
    return (
      !!requestInformation.dateOfMarriageExact ||
      !!requestInformation.dateOfMarriageUnsure
    );
  }

  private handleDateExactChange = (newDate: Date | null): void => {
    this.props.marriageCertificateRequest.answerQuestion({
      dateOfMarriageExact: newDate,
    });
  };

  private handleDateUnsureChange = (newDate: string): void => {
    this.props.marriageCertificateRequest.answerQuestion({
      dateOfMarriageUnsure: newDate,
    });
  };

  public setRangeInvalid = (rangeInvalid: boolean): void => {
    this.setState({ isRangeInvalid: rangeInvalid });
  };

  private handleDateKnownSelection = (selection: 'exact' | 'unsure'): void => {
    const { marriageCertificateRequest } = this.props;
    const {
      dateOfMarriageExact,
      dateOfMarriageUnsure,
    } = marriageCertificateRequest.requestInformation;

    // If changing from knowing exact date to not, clear any value that might
    // have been set.
    if (selection === 'exact') {
      if (dateOfMarriageUnsure) {
        this.props.marriageCertificateRequest.answerQuestion({
          dateOfMarriageUnsure: '',
        });
      }

      this.setState({ knowsExact: 'yes' });
    } else {
      if (dateOfMarriageExact) {
        this.props.marriageCertificateRequest.answerQuestion({
          dateOfMarriageExact: null,
        });
      }

      this.setState({ knowsExact: 'no' });
    }
  };

  public render() {
    const { marriageCertificateRequest } = this.props;
    const {
      dateOfMarriageExact,
      dateOfMarriageUnsure,
    } = marriageCertificateRequest.requestInformation;

    const emptyDateRange: boolean =
      dateOfMarriageUnsure === '00/0000 - 00/0000';

    return (
      <QuestionComponent
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        allowProceed={
          DateOfMarriage.isComplete(marriageCertificateRequest) &&
          !this.state.isRangeInvalid
        }
      >
        <h2
          css={SECTION_HEADING_STYLING}
          style={{ marginBottom: '1.5rem' }}
          id="exactDateQuestion"
        >
          Do you know the exact date of the marriage?
        </h2>

        <div
          role="radiogroup"
          aria-labelledby="exactDateQuestion"
          css={[RADIOGROUP_STYLING, RADIOITEM_STYLING]}
          style={{ marginBottom: '1.5rem' }}
        >
          <RadioItemComponent
            questionName="dateOfMarriage"
            questionValue={this.state.knowsExact || ''}
            itemValue="yes"
            labelText="yes"
            handleChange={() => this.handleDateKnownSelection('exact')}
          >
            <AnswerIcon iconName="checkMark" />
          </RadioItemComponent>

          <RadioItemComponent
            questionName="dateOfMarriage"
            questionValue={this.state.knowsExact || ''}
            itemValue="no"
            labelText="no"
            handleChange={() => this.handleDateKnownSelection('unsure')}
          >
            <AnswerIcon iconName="xSymbol" />
          </RadioItemComponent>
        </div>

        {this.state.knowsExact ? (
          <div className="m-v700">
            {this.state.knowsExact === 'yes' ? (
              <MemorableDateInput
                legend={
                  <h2
                    css={SECTION_HEADING_STYLING}
                    style={{ marginBottom: '1.5rem' }}
                  >
                    What was the date of the marriage?
                  </h2>
                }
                initialDate={dateOfMarriageExact || undefined}
                componentId="dateOfMarriageStart"
                onlyAllowPast={true}
                earliestDate={EARLIEST_DATE}
                handleDate={this.handleDateExactChange}
              />
            ) : (
              <>
                <h2 css={SECTION_HEADING_STYLING}>
                  Please enter a date range.
                </h2>

                <p>The two dates should be within a five year period.</p>

                <DateRangePicker
                  onChange={this.handleDateUnsureChange}
                  dateRange={emptyDateRange ? undefined : dateOfMarriageUnsure}
                  setRangeInvalid={this.setRangeInvalid}
                />
              </>
            )}
          </div>
        ) : (
          <></>
        )}

        {dateOfMarriageExact &&
          (isDateWithinTenDays(dateOfMarriageExact) ||
            this.props.showRecentBirthWarning) &&
          this.renderRecentMarriageWarningText()}
      </QuestionComponent>
    );
  }

  private renderRecentMarriageWarningText(): ReactChild {
    return (
      <div className={NOTE_BOX_CLASSNAME} style={{ paddingBottom: 0 }}>
        <h2 className="h3 tt-u">
          We might not have the marriage certificate yet
        </h2>

        <p>
          <strong>
            We recommend waiting at least two weeks before you request a
            marriage certificate.
          </strong>{' '}
          Once a marriage license has been filed, it generally takes two weeks
          for the marriage certificate to be issued.
        </p>

        <p>
          If you order too early, we can only hold your request for seven days
          while we wait for the marriage certificate. If we don’t receive the
          record in time, your request will be canceled automatically and your
          card will not be charged. You’ll have to resubmit your request.
        </p>
      </div>
    );
  }
}

function isDateWithinTenDays(date: Date): boolean {
  const dayInMs = 8.64e7;
  const tenDaysAgo = new Date(Date.now() - 10 * dayInMs);

  return tenDaysAgo < date;
}
