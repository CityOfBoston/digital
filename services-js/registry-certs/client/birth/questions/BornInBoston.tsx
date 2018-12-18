import React from 'react';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

import { YesNoUnknownAnswer } from '../../types';

interface Props {
  forSelf: boolean | null;
  bornInBoston?: YesNoUnknownAnswer;
  parentsLivedInBoston?: YesNoUnknownAnswer;

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
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      [event.target.name]: event.target.value,
    } as any);
  };

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

  private userCannotProceed(): boolean {
    return (
      this.state.bornInBoston === 'no' &&
      this.state.parentsLivedInBoston === 'no'
    );
  }

  public render() {
    const { forSelf } = this.props;
    const notBornInBoston =
      this.state.bornInBoston && this.state.bornInBoston !== 'yes';
    const showDisclaimer = this.userCannotProceed();

    return (
      <>
        <QuestionComponent
          handleProceed={() => this.props.handleProceed(this.state)}
          handleStepBack={this.props.handleStepBack}
          handleReset={this.props.handleUserReset}
          allowProceed={this.allowProceed()}
          startOver={this.userCannotProceed()}
        >
          <FieldsetComponent
            legendText={
              <h2 id="bornInBoston">
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
                <h3 id="parentsLivedInBoston">
                  Were {forSelf ? 'your' : 'their'} parents living in Boston at
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
        </QuestionComponent>

        {showDisclaimer && (
          <aside className="m-t500">
            <p>
              We only have records for people born in the City of Boston, or
              people whose parents were married and living in Boston at the time
              of the birth.
            </p>

            <p>
              Please contact the town, city, state, or country where{' '}
              {forSelf ? 'you' : 'they'} were born to find the record.
            </p>
          </aside>
        )}
      </>
    );
  }
}
