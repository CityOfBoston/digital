import React from 'react';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

import { YesNoUnknownAnswer } from '../QuestionsFlow';

interface Props {
  forSelf: boolean | null;
  bornInBoston?: YesNoUnknownAnswer;
  parentsLivedInBoston?: YesNoUnknownAnswer;

  handleProceed: (answers: Partial<State>) => void;
  handleStepBack: () => void;
  handleUserReset: () => void;
}

interface State {
  bornInBoston: YesNoUnknownAnswer;
  parentsLivedInBoston: YesNoUnknownAnswer;
}

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
    } else if (
      this.state.parentsLivedInBoston === 'yes' ||
      this.state.parentsLivedInBoston === 'unknown'
    ) {
      return true;
    } else {
      return false;
    }
  }

  private startOver(): boolean {
    return (
      this.state.bornInBoston === 'no' &&
      this.state.parentsLivedInBoston === 'no'
    );
  }

  public render() {
    const { forSelf } = this.props;

    return (
      <QuestionComponent
        handleProceed={() => this.props.handleProceed(this.state)}
        handleStepBack={this.props.handleStepBack}
        handleReset={this.props.handleUserReset}
        allowProceed={this.allowProceed()}
        startOver={this.startOver()}
      >
        <FieldsetComponent
          legendText={
            <h2>Were {forSelf ? 'you' : 'they'} born in the City of Boston?</h2>
          }
        >
          <YesNoUnsureComponent
            questionName="bornInBoston"
            questionValue={this.state.bornInBoston}
            handleChange={this.handleChange}
          />
        </FieldsetComponent>

        {/* This question is only presented if the user selects NO or UNKNOWN for bornInBoston. */}
        {/* If NO for both “born in Boston” and “parents lived in Boston”, exit the workflow and inform the user. */}
        {/* If UNKNOWN for either question, proceed to next question. */}

        {(this.state.bornInBoston === 'no' ||
          this.state.bornInBoston === 'unknown') && (
          <FieldsetComponent
            legendText={
              <h3>
                Did {forSelf ? 'your' : 'their'} parents live in Boston when{' '}
                {forSelf ? 'you' : 'they'} were born?
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
    );
  }
}
