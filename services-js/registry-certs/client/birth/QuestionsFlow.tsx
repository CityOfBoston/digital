import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { PageDependencies } from '../../pages/_app';

import PageLayout from '../PageLayout';

import ForSelf from './questions/ForSelf';
import BornInBoston from './questions/BornInBoston';
import NameOnRecord from './questions/NameOnRecord';
import DateOfBirth from './questions/DateOfBirth';
import ParentsMarried from './questions/ParentsMarried';
import ParentsNames from './questions/ParentsNames';

import { BREADCRUMB_NAV_LINKS } from './constants';

import { PROGRESS_BAR_STYLE } from './questions/styling';

export type Question =
  | 'forSelf'
  | 'bornInBoston'
  | 'nameOnRecord'
  | 'dateOfBirth'
  | 'parentsMarried'
  | 'parentsNames'
  | 'reviewRequest'
  | 'parentsLivedInBoston'
  | 'howRelated';

interface Props extends Pick<PageDependencies, 'birthCertificateRequest'> {}

interface State {
  activeQuestion: Question;
  questions: Question[];
  answeredQuestions: Question[];
}

const INITIAL_STATE: State = {
  activeQuestion: 'forSelf',
  answeredQuestions: [],
  questions: [
    'forSelf',
    'bornInBoston',
    'nameOnRecord',
    'dateOfBirth',
    'parentsMarried',
    'parentsNames',
  ],
};

/**
 * Guides the user through a number of questions in order to provide the
 * Registry with the information they will need to locate the birth record.
 *
 * User will progress to /review upon completion of this workflow.
 */
export default class QuestionsFlow extends React.Component<Props, State> {
  state: State = INITIAL_STATE;

  private answerQuestion = (question, answers): void => {
    const currentIndex = this.state.questions.indexOf(question);

    if (question === 'forSelf') {
      const forSelf = answers.forSelf === 'true';

      this.props.birthCertificateRequest.answerQuestion({
        ...answers,
        forSelf,
      });
    } else {
      this.props.birthCertificateRequest.answerQuestion(answers);
    }

    if (question === 'parentsNames') {
      Router.push('/birth/review');
    } else {
      this.setState({ activeQuestion: this.state.questions[currentIndex + 1] });
    }
  };

  private stepBackOneQuestion = (): void => {
    const currentIndex = this.state.questions.indexOf(
      this.state.activeQuestion
    );
    // Ensure we cannot go back any further than the first question.
    const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;

    this.setState({ activeQuestion: this.state.questions[newIndex] });
  };

  // Clear all data and return to initial question.
  private handleUserReset = (): void => {
    this.setState({ ...INITIAL_STATE });
    this.props.birthCertificateRequest.clearBirthCertificateRequest();
  };

  public progressBar(): React.ReactChild {
    const currentIndex = this.state.questions.indexOf(
      this.state.activeQuestion
    );

    return (
      <progress
        aria-label="Progress"
        max="6"
        value={currentIndex}
        className={PROGRESS_BAR_STYLE}
      >
        Step {currentIndex + 1}
      </progress>
    );
  }

  componentDidMount(): void {
    // If parent1FirstName has a value, the user has come over from /review
    if (
      this.props.birthCertificateRequest.requestInformation.parent1FirstName
    ) {
      this.setState({ activeQuestion: 'parentsNames' });
    }
  }

  public render() {
    const answers = this.props.birthCertificateRequest.requestInformation;
    const forSelf = answers.forSelf;

    return (
      <>
        <Head>
          <title>Boston.gov — Birth Certificates</title>

          <style>{'.txt-f { border-radius: 0; }'}</style>
        </Head>

        <PageLayout breadcrumbNav={BREADCRUMB_NAV_LINKS}>
          <div className="b-c b-c--nbp">
            <h1 className="sh-title">Request a birth certificate</h1>

            {this.progressBar()}

            {this.state.activeQuestion === 'forSelf' && (
              <ForSelf
                forSelf={answers.forSelf}
                howRelated={answers.howRelated}
                handleProceed={a => this.answerQuestion('forSelf', a)}
              />
            )}

            {this.state.activeQuestion === 'bornInBoston' && (
              <BornInBoston
                forSelf={forSelf}
                parentsLivedInBoston={answers.parentsLivedInBoston}
                bornInBoston={answers.bornInBoston}
                handleProceed={a => this.answerQuestion('bornInBoston', a)}
                handleStepBack={this.stepBackOneQuestion}
                handleUserReset={this.handleUserReset}
              />
            )}

            {this.state.activeQuestion === 'nameOnRecord' && (
              <NameOnRecord
                forSelf={forSelf}
                firstName={answers.firstName}
                lastName={answers.lastName}
                altSpelling={answers.altSpelling}
                handleProceed={a => this.answerQuestion('nameOnRecord', a)}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'dateOfBirth' && (
              <DateOfBirth
                forSelf={forSelf}
                firstName={answers.firstName}
                birthDate={answers.birthDate}
                handleProceed={a => this.answerQuestion('dateOfBirth', a)}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'parentsMarried' && (
              <ParentsMarried
                forSelf={forSelf}
                firstName={answers.firstName}
                parentsMarried={answers.parentsMarried}
                handleProceed={a => this.answerQuestion('parentsMarried', a)}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {this.state.activeQuestion === 'parentsNames' && (
              <ParentsNames
                forSelf={forSelf}
                parentsMarried={answers.parentsMarried}
                firstName={answers.firstName}
                parent1FirstName={answers.parent1FirstName}
                parent1LastName={answers.parent1LastName}
                parent2FirstName={answers.parent2FirstName}
                parent2LastName={answers.parent2LastName}
                handleProceed={a => this.answerQuestion('parentsNames', a)}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}
          </div>
        </PageLayout>
      </>
    );
  }
}
