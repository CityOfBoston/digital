import React from 'react';
import Head from 'next/head';

import PageLayout, { breadcrumbNav } from '../PageLayout';

import ForSelf from './questions/ForSelf';
import HowRelated from './questions/HowRelated';
import BornInBoston from './questions/BornInBoston';
import ParentsLivedInBoston from './questions/ParentsLivedInBoston';
import NameOnRecord from './questions/NameOnRecord';
import DateOfBirth from './questions/DateOfBirth';
import ParentsMarried from './questions/ParentsMarried';
import ParentsNames from './questions/ParentsNames';
import EndFlow from './questions/EndFlow';

export type question =
  | 'forSelf'
  | 'howRelated'
  | 'bornInBoston'
  | 'parentsLivedInBoston'
  | 'nameOnRecord'
  | 'dateOfBirth'
  | 'parentsMarried'
  | 'parentsNames'
  | 'endFlow';

export type relation =
  | 'parent'
  | 'grandparent'
  | 'sibling'
  | 'spouse'
  | 'friend'
  | 'attorney'
  | 'guardian'
  | 'other'
  | string;

export type yesNoUnknownAnswer = 'yes' | 'no' | 'unknown' | string;

export interface RequestInformation {
  forSelf: boolean;
  howRelated?: relation;
  bornInBoston: yesNoUnknownAnswer;
  parentsLivedInBoston?: yesNoUnknownAnswer;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // todo: store as Date
  parentsMarried: yesNoUnknownAnswer;
  parent1FirstName: string;
  parent1LastName?: string;
  parent2FirstName?: string;
  parent2LastName?: string;
}

interface Props {}

interface State extends RequestInformation {
  activeQuestion: question;
  answeredQuestions: question[];
}

const breadcrumbNavLinks: breadcrumbNav = {
  parentLinks: [
    {
      url: 'https://www.boston.gov/departments',
      text: 'Departments',
    },
    {
      url: 'https://www.boston.gov/departments/registry',
      text: 'Registry: Birth, death, and marriage',
    },
  ],
  currentPage: {
    url: '/birth',
    text: 'Birth certificates',
  },
};

const initialState = {
  activeQuestion: 'forSelf',
  answeredQuestions: [],
  forSelf: '',
  howRelated: '',
  bornInBoston: '',
  parentsLivedInBoston: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  parentsMarried: '',
  parent1FirstName: '',
  parent1LastName: '',
  parent2FirstName: '',
  parent2LastName: '',
};

/**
 * Guides the user through a number of questions in order to provide the
 * Registry with the information they will need to locate the birth record.
 *
 * User will progress to checkout upon completion of this workflow.
 */

// todo: sort things out to remove all @ts-ignores
export default class QuestionsFlow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // @ts-ignore
    this.state = initialState;
  }

  // this.state.answeredQuestions is an ordered record of the questions asked.
  addToAnsweredQuestions(newQuestion: question): void {
    const { answeredQuestions } = this.state;

    answeredQuestions.push(newQuestion);

    this.setState({ answeredQuestions });
  }

  // Add question to answeredQuestions, then move to next question.
  proceedToNextQuestion = (
    currentQuestion: question,
    nextQuestion: question
  ): void => {
    this.setState({ activeQuestion: nextQuestion });

    this.addToAnsweredQuestions(currentQuestion);
  };

  // When the user selects “back”, we treat that previous question
  // as unanswered, and return to its screen.
  stepBackOneQuestion = () => {
    interface FieldsToClear {
      firstName?: string;
      lastName?: string;
      parent1FirstName?: string;
      parent1LastName?: string;
      parent2FirstName?: string;
      parent2LastName?: string;
    }

    const answeredQuestions: question[] = this.state.answeredQuestions;
    // @ts-ignore
    const prevQuestion: question = answeredQuestions.pop();

    const fieldsToClear: FieldsToClear = {};

    // If a question’s answer is made up of multiple fields,
    // we must explicitly list them.
    if (prevQuestion === 'nameOnRecord') {
      fieldsToClear.firstName = '';
      fieldsToClear.lastName = '';
    } else if (prevQuestion === 'parentsNames') {
      fieldsToClear.parent1FirstName = '';
      fieldsToClear.parent1LastName = '';
      fieldsToClear.parent2FirstName = '';
      fieldsToClear.parent2LastName = '';
    } else {
      fieldsToClear[prevQuestion] = '';
    }

    // @ts-ignore
    this.setState({
      answeredQuestions,
      activeQuestion: prevQuestion,
      ...fieldsToClear,
    });
  };

  handleTextInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // @ts-ignore
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleForSelf = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = JSON.parse(event.target.value);

    this.setState({ forSelf: value }, () =>
      this.proceedToNextQuestion(
        'forSelf',
        value ? 'bornInBoston' : 'howRelated'
      )
    );
  };

  // This question is only presented if the user is NOT
  // requesting their own record.
  handleHowRelated = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ howRelated: event.target.value }, () =>
      this.proceedToNextQuestion('howRelated', 'bornInBoston')
    );
  };

  // If the user selects NO for bornInBoston, check to see if
  // the parents lived in Boston at the time of birth.
  handleBornInBoston = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value: yesNoUnknownAnswer = event.target.value;

    this.setState({ bornInBoston: value }, () =>
      this.proceedToNextQuestion(
        'bornInBoston',
        value === 'yes' ? 'nameOnRecord' : 'parentsLivedInBoston'
      )
    );
  };

  // This question is only presented if the user selects NO or UNKNOWN for bornInBoston.
  // If NO for both “born in Boston” and “parents lived in Boston”,
  // exit the workflow and inform the user.
  // If UNKNOWN for either question, proceed to next question.
  handleParentsLivedInBoston = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value: yesNoUnknownAnswer = event.target.value;

    this.setState({ parentsLivedInBoston: value }, () =>
      this.proceedToNextQuestion(
        'parentsLivedInBoston',
        value === 'no' && this.state.bornInBoston === 'no'
          ? 'endFlow'
          : 'nameOnRecord'
      )
    );
  };

  handleNameOnRecord = (): void => {
    this.proceedToNextQuestion('nameOnRecord', 'dateOfBirth');
  };

  handleDateOfBirth = (): void => {
    this.proceedToNextQuestion('dateOfBirth', 'parentsMarried');
  };

  handleParentsMarried = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ parentsMarried: event.target.value }, () =>
      this.proceedToNextQuestion('parentsMarried', 'parentsNames')
    );
  };

  handleParentsNames = (): void => {
    this.proceedToNextQuestion('parentsNames', 'endFlow');
  };

  render() {
    return (
      <>
        <Head>
          <title>Boston.gov — Birth Certificates</title>
        </Head>

        <PageLayout breadcrumbNav={breadcrumbNavLinks}>
          <div className="b-c b-c--nbp">
            <h1 className="sh-title">Request a birth certificate</h1>

            {this.state.activeQuestion === 'forSelf' && (
              <p>We have a few questions for you.</p>
            )}

            {this.state.activeQuestion === 'forSelf' && (
              <ForSelf handleChange={this.handleForSelf} />
            )}

            {this.state.activeQuestion === 'howRelated' && (
              <HowRelated
                howRelated={this.state.howRelated || ''}
                handleChange={this.handleHowRelated}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'bornInBoston' && (
              <BornInBoston
                forSelf={this.state.forSelf}
                handleChange={this.handleBornInBoston}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'parentsLivedInBoston' && (
              <ParentsLivedInBoston
                forSelf={this.state.forSelf}
                handleChange={this.handleParentsLivedInBoston}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'nameOnRecord' && (
              <NameOnRecord
                handleTextInput={this.handleTextInput}
                handleProceed={this.handleNameOnRecord}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'dateOfBirth' && (
              <DateOfBirth
                forSelf={this.state.forSelf}
                firstName={this.state.firstName}
                handleTextInput={this.handleTextInput}
                handleProceed={this.handleDateOfBirth}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'parentsMarried' && (
              <ParentsMarried
                forSelf={this.state.forSelf}
                firstName={this.state.firstName}
                handleChange={this.handleParentsMarried}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'parentsNames' && (
              <ParentsNames
                forSelf={this.state.forSelf}
                parentsMarried={this.state.parentsMarried}
                firstName={this.state.firstName}
                handleTextInput={this.handleTextInput}
                handleProceed={this.handleParentsNames}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'endFlow' && (
              <EndFlow
                forSelf={this.state.forSelf}
                firstName={this.state.firstName}
                lastName={this.state.lastName}
                dateOfBirth={this.state.dateOfBirth}
                bornInBoston={this.state.bornInBoston}
                parentsMarried={this.state.parentsMarried}
                parentsLivedInBoston={this.state.parentsLivedInBoston}
              />
            )}
          </div>
        </PageLayout>
      </>
    );
  }
}
