import React from 'react';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

import { YesNoUnknownAnswer } from '../../types';
import { QUESTION_TEXT_STYLING } from './styling';

interface Props {
  forSelf: boolean | null;
  bornInBoston?: YesNoUnknownAnswer;
  parentsLivedInBoston?: YesNoUnknownAnswer;

  handleStepCompletion: (isStepComplete: boolean) => void;
  handleProceed: (answers: State) => void;
  handleStepBack: () => void;
  handleUserReset: () => void;
}

interface State {
  bornInBoston: YesNoUnknownAnswer;
  parentsLivedInBoston: YesNoUnknownAnswer;
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
export default class BornInBoston extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      bornInBoston: props.bornInBoston || '',
      parentsLivedInBoston: props.parentsLivedInBoston || '',
    };

    props.handleStepCompletion(
      props.bornInBoston === 'yes' ||
        props.parentsLivedInBoston === 'yes' ||
        props.parentsLivedInBoston === 'unknown'
    );
  }

  // Activates the “next” button, and shows progress for this step.
  private allowProceed(): boolean {
    if (this.state.bornInBoston === 'yes') {
      return true;
    } else {
      return (
        this.state.parentsLivedInBoston === 'yes' ||
        this.state.parentsLivedInBoston === 'unknown'
      );
    }
  }

  // If true, the user has come to a dead end in the question flow.
  private userCannotProceed(): boolean {
    return (
      this.state.bornInBoston === 'no' &&
      this.state.parentsLivedInBoston === 'no'
    );
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState(
      {
        [event.target.name]: event.target.value,
      } as any,
      () => {
        this.props.handleStepCompletion(this.allowProceed());
      }
    );
  };

  // Returns a function to provide appropriate behavior for “back” button.
  private handleStepBack(): () => void {
    if (this.userCannotProceed()) {
      return () =>
        this.setState({ bornInBoston: '', parentsLivedInBoston: '' });
    } else {
      return this.props.handleStepBack;
    }
  }

  public render() {
    const { forSelf } = this.props;
    const notBornInBoston =
      this.state.bornInBoston && this.state.bornInBoston !== 'yes';
    const cannotProceed = this.userCannotProceed();

    return (
      <QuestionComponent
        handleProceed={() => this.props.handleProceed(this.state)}
        handleStepBack={this.handleStepBack()}
        handleReset={this.props.handleUserReset}
        allowProceed={this.allowProceed()}
        startOver={cannotProceed}
      >
        {cannotProceed ? (
          <div className="m-t500">
            <h2 className="sh-title">
              Sorry, we don’t have {forSelf ? 'your' : 'their'} record
            </h2>
            <p>
              We only have records for people born in the City of Boston, or
              people whose parents were married and living in Boston at the time
              of the birth.
            </p>

            <p>
              Please contact the town, city, state, or country where{' '}
              {forSelf ? 'you' : 'they'} were born to find the record.
            </p>
          </div>
        ) : (
          <>
            <FieldsetComponent
              legendText={
                <h2 id="bornInBoston" className={QUESTION_TEXT_STYLING}>
                  Were {forSelf ? 'you' : 'they'} born in Boston?
                </h2>
              }
            >
              <YesNoUnsureComponent
                questionName="bornInBoston"
                questionValue={this.state.bornInBoston}
                handleChange={this.handleChange}
              />
            </FieldsetComponent>

            {notBornInBoston && (
              <FieldsetComponent
                legendText={
                  <h3
                    id="parentsLivedInBoston"
                    className={QUESTION_TEXT_STYLING}
                  >
                    Did {forSelf ? 'your' : 'their'} parents live in Boston at
                    the time of {forSelf ? 'your' : 'their'} birth?
                  </h3>
                }
              >
                <YesNoUnsureComponent
                  questionName="parentsLivedInBoston"
                  questionValue={this.state.parentsLivedInBoston}
                  handleChange={this.handleChange}
                />
              </FieldsetComponent>
            )}
          </>
        )}
      </QuestionComponent>
    );
  }
}
