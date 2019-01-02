import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { PageDependencies } from '../../pages/_app';

import PageLayout from '../PageLayout';

import ForSelf from './questions/ForSelf';
import BornInBoston from './questions/BornInBoston';
import NameOnRecord from './questions/NameOnRecord';
import DateOfBirth from './questions/DateOfBirth';
import ParentsMarried from './questions/ParentsMarried';
import ParentsNames from './questions/ParentsNames';

import { BREADCRUMB_NAV_LINKS, QUESTIONS } from './constants';
import { Question, BirthCertificateRequestInformation } from '../types';

import { PROGRESS_BAR_STYLE } from './questions/styling';

interface Props extends Pick<PageDependencies, 'birthCertificateRequest'> {}

/**
 * Guides the user through a number of questions in order to provide the
 * Registry with the information they will need to locate the birth record.
 *
 * User will progress to /review upon completion of this workflow.
 */
@observer
export default class QuestionsFlow extends React.Component<Props> {
  private answerQuestion = (
    question: Question,
    answers: Partial<BirthCertificateRequestInformation>
  ): void => {
    const {
      answerQuestion,
      setActiveQuestion,
    } = this.props.birthCertificateRequest;
    const currentIndex = QUESTIONS.indexOf(question);

    if (question === 'forSelf') {
      answerQuestion({
        ...answers,
        forSelf: answers.forSelf === ('true' as any),
      });
    } else {
      answerQuestion(answers);
    }

    if (question === 'parentsNames') {
      Router.push('/birth/review');
    } else {
      setActiveQuestion(QUESTIONS[currentIndex + 1]);
    }
  };

  private stepBackOneQuestion = (): void => {
    const {
      activeQuestion,
      setActiveQuestion,
    } = this.props.birthCertificateRequest;
    const currentIndex = QUESTIONS.indexOf(activeQuestion);
    // Ensure we cannot go back any further than the first question.
    const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;

    setActiveQuestion(QUESTIONS[newIndex]);
  };

  // Clear all data and return to initial question.
  private handleUserReset = (): void => {
    this.props.birthCertificateRequest.clearBirthCertificateRequest();
  };

  public progressBar(): React.ReactChild {
    const currentStep =
      QUESTIONS.indexOf(this.props.birthCertificateRequest.activeQuestion) + 1;

    return (
      <progress
        aria-label="Progress"
        max="6"
        value={currentStep}
        className={PROGRESS_BAR_STYLE}
      >
        Step {currentStep}
      </progress>
    );
  }

  public render() {
    const answers = this.props.birthCertificateRequest.requestInformation;
    const { activeQuestion } = this.props.birthCertificateRequest;
    const forSelf = answers.forSelf;

    return (
      <>
        <Head>
          <title>Boston.gov — Birth Certificates</title>
        </Head>

        <PageLayout breadcrumbNav={BREADCRUMB_NAV_LINKS}>
          <div className="b-c b-c--nbp">
            <h1 className="sh-title">Request a birth certificate</h1>

            {this.progressBar()}

            {activeQuestion === 'forSelf' && (
              <ForSelf
                forSelf={answers.forSelf}
                howRelated={answers.howRelated}
                handleProceed={a => this.answerQuestion('forSelf', a as any)}
              />
            )}

            {activeQuestion === 'bornInBoston' && (
              <BornInBoston
                forSelf={forSelf}
                parentsLivedInBoston={answers.parentsLivedInBoston}
                bornInBoston={answers.bornInBoston}
                handleProceed={a => this.answerQuestion('bornInBoston', a)}
                handleStepBack={this.stepBackOneQuestion}
                handleUserReset={this.handleUserReset}
              />
            )}

            {activeQuestion === 'nameOnRecord' && (
              <NameOnRecord
                forSelf={forSelf}
                firstName={answers.firstName}
                lastName={answers.lastName}
                altSpelling={answers.altSpelling}
                handleProceed={a => this.answerQuestion('nameOnRecord', a)}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {activeQuestion === 'dateOfBirth' && (
              <DateOfBirth
                forSelf={forSelf}
                firstName={answers.firstName}
                birthDate={answers.birthDate}
                handleProceed={a => this.answerQuestion('dateOfBirth', a)}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {activeQuestion === 'parentsMarried' && (
              <ParentsMarried
                forSelf={forSelf}
                firstName={answers.firstName}
                parentsMarried={answers.parentsMarried}
                handleProceed={a => this.answerQuestion('parentsMarried', a)}
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {activeQuestion === 'parentsNames' && (
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
