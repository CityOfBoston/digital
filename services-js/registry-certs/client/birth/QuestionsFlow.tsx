import React from 'react';
import Head from 'next/head';

import PageLayout from '../PageLayout';

import ForSelf from './questions/ForSelf';
import BornInBoston from './questions/BornInBoston';
import NameOnRecord from './questions/NameOnRecord';
import DateOfBirth from './questions/DateOfBirth';
import ParentsMarried from './questions/ParentsMarried';
import ParentsNames from './questions/ParentsNames';

import { Question, RequestInformation } from './types';
import { BREADCRUMB_NAV_LINKS } from './constants';

import { PROGRESS_BAR_STYLING } from './questions/styling';

interface Props {}

interface State extends RequestInformation {
  activeQuestion: Question;
  answeredQuestions: Question[];
}

// This is also used to reset all fields when user selects “start over”
const INITIAL_STATE: State = {
  activeQuestion: 'forSelf',
  answeredQuestions: [],
  forSelf: null,
  howRelated: '',
  bornInBoston: '',
  parentsLivedInBoston: '',
  firstName: '',
  lastName: '',
  altSpelling: '',
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
export default class QuestionsFlow extends React.Component<Props, State> {
  state: State = INITIAL_STATE;

  // this.state.answeredQuestions is an ordered record of the questions asked.
  private addToAnsweredQuestions(newQuestion: Question): void {
    const answeredQuestions = this.state.answeredQuestions;

    this.setState({ answeredQuestions: [...answeredQuestions, newQuestion] });
  }

  // Add question to answeredQuestions list, then move to next question.
  private proceedToNextQuestion = (
    currentQuestion: Question,
    nextQuestion: Question
  ): void => {
    this.setState({ activeQuestion: nextQuestion });

    this.addToAnsweredQuestions(currentQuestion);
  };

  // When the user selects “back”, we treat that previous question
  // as unanswered, and return to its screen.
  private stepBackOneQuestion = () => {
    const answeredQuestions = [...this.state.answeredQuestions];
    const prevQuestion = answeredQuestions.pop()!;

    const fieldsToClear: State = {} as any;

    // If a question’s answer is made up of multiple fields,
    // we must explicitly list them.
    if (prevQuestion === 'forSelf') {
      fieldsToClear.forSelf = null;
      fieldsToClear.howRelated = '';
    } else if (prevQuestion === 'bornInBoston') {
      fieldsToClear.bornInBoston = '';
      fieldsToClear.parentsLivedInBoston = '';
    } else if (prevQuestion === 'nameOnRecord') {
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

    this.setState({
      answeredQuestions,
      activeQuestion: prevQuestion,
      ...fieldsToClear,
    });
  };

  // Clear all data and return to initial question.
  private handleUserReset = (): void => {
    this.setState({ ...INITIAL_STATE });
  };

  private handleAnswers = (answers, currentQuestion, nextQuestion): void => {
    this.setState({ ...answers });
    this.proceedToNextQuestion(currentQuestion, nextQuestion);
  };

  private handleForSelf = (answers): void => {
    const forSelf = answers.forSelf === 'true';

    this.setState({ ...answers, forSelf });
    this.proceedToNextQuestion('forSelf', 'bornInBoston');
  };

  public render() {
    return (
      <>
        <Head>
          <title>Boston.gov — Birth Certificates</title>

          <style>{'.txt-f { border-radius: 0; }'}</style>
        </Head>

        <PageLayout breadcrumbNav={BREADCRUMB_NAV_LINKS}>
          <div className="b-c b-c--nbp">
            <h1 className="sh-title">Request a birth certificate</h1>

            <progress
              aria-label="Progress"
              max="6"
              value={this.state.answeredQuestions.length}
              className={PROGRESS_BAR_STYLING}
            >
              Step {this.state.answeredQuestions.length + 1}
            </progress>

            {this.state.activeQuestion === 'forSelf' && (
              <ForSelf handleProceed={this.handleForSelf} />
            )}

            {this.state.activeQuestion === 'bornInBoston' && (
              <BornInBoston
                forSelf={this.state.forSelf}
                handleProceed={a =>
                  this.handleAnswers(a, 'bornInBoston', 'nameOnRecord')
                }
                handleStepBack={this.stepBackOneQuestion}
                handleUserReset={this.handleUserReset}
              />
            )}

            {this.state.activeQuestion === 'nameOnRecord' && (
              <NameOnRecord
                forSelf={this.state.forSelf}
                handleProceed={a =>
                  this.handleAnswers(a, 'nameOnRecord', 'dateOfBirth')
                }
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'dateOfBirth' && (
              <DateOfBirth
                forSelf={this.state.forSelf}
                firstName={this.state.firstName}
                dateOfBirth={this.state.dateOfBirth}
                handleProceed={a =>
                  this.handleAnswers(a, 'dateOfBirth', 'parentsMarried')
                }
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'parentsMarried' && (
              <ParentsMarried
                forSelf={this.state.forSelf}
                firstName={this.state.firstName}
                parentsMarried={this.state.parentsMarried}
                handleProceed={a =>
                  this.handleAnswers(a, 'parentsMarried', 'parentsNames')
                }
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'parentsNames' && (
              <ParentsNames
                forSelf={this.state.forSelf}
                parentsMarried={this.state.parentsMarried}
                firstName={this.state.firstName}
                parent1FirstName={this.state.parent1FirstName}
                parent1LastName={this.state.parent1LastName}
                parent2FirstName={this.state.parent2FirstName}
                parent2LastName={this.state.parent2LastName}
                handleProceed={a =>
                  this.handleAnswers(a, 'parentsNames', 'endFlow')
                }
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'endFlow' && (
              <p>[[ end of flow; display summary ]]</p>
            )}
          </div>
        </PageLayout>
      </>
    );
  }
}
