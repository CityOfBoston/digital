import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { PageDependencies } from '../../pages/_app';

import PageWrapper from './PageWrapper';

import ForWhom from './questions/ForWhom';
import BornInBoston from './questions/BornInBoston';
import PersonalInformation from './questions/PersonalInformation';
import ParentalInformation from './questions/ParentalInformation';
import VerifyIdentification from './questions/VerifyIdentification';

import { BirthCertificateRequestInformation, Step } from '../types';

interface Props extends Pick<PageDependencies, 'birthCertificateRequest'> {}

/**
 * Guides the user through a number of questions, step by step, in order to
 * provide the Registry with the information they will need to locate the
 * birth record.
 *
 * User will progress to /review upon completion of this workflow.
 */
@observer
export default class QuestionsPage extends React.Component<Props> {
  private answerQuestion = (
    question: Step,
    answers: Partial<BirthCertificateRequestInformation>
  ): void => {
    const {
      answerQuestion,
      setCurrentStep,
      steps,
    } = this.props.birthCertificateRequest;
    const currentIndex = steps.indexOf(question);

    // We need to convert this value to a boolean for the request state object.
    if (question === 'forWhom') {
      answerQuestion({
        ...answers,
        forSelf: answers.forSelf === ('true' as any),
      });
    } else {
      answerQuestion(answers);
    }

    // If ID verification is not known to be necessary, advance to the
    // review page.
    // Otherwise, continue to verifyIdentification step. When completed,
    // then advance to the review page.
    if (
      question === 'parentalInformation' &&
      !steps.includes('verifyIdentification')
    ) {
      Router.push('/birth/review');
    } else if (question === 'verifyIdentification') {
      Router.push('/birth/review');
    } else {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  private stepBackOneQuestion = (): void => {
    const {
      steps,
      currentStep,
      setCurrentStep,
    } = this.props.birthCertificateRequest;
    const currentIndex = steps.indexOf(currentStep);

    // Ensure we cannot go back any further than the first question.
    const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;

    setCurrentStep(steps[newIndex]);
  };

  // Clear all data and return to initial question.
  private handleUserReset = (): void => {
    this.props.birthCertificateRequest.clearBirthCertificateRequest();
  };

  public render() {
    const {
      requestInformation: answers,
      steps,
      currentStep,
      currentStepCompleted,
      setCurrentStepCompleted,
    } = this.props.birthCertificateRequest;

    return (
      <PageWrapper
        progress={{
          totalSteps: steps.length,
          currentStep: steps.indexOf(currentStep) + 1,
          currentStepCompleted: currentStepCompleted,
        }}
      >
        <Head>
          <title>Boston.gov — Request a Birth Certificate</title>
        </Head>

        {currentStep === 'forWhom' && (
          <ForWhom
            forSelf={answers.forSelf}
            howRelated={answers.howRelated}
            handleStepCompletion={setCurrentStepCompleted}
            handleProceed={a => this.answerQuestion('forWhom', a as any)}
          />
        )}

        {currentStep === 'bornInBoston' && (
          <BornInBoston
            {...answers}
            handleStepCompletion={setCurrentStepCompleted}
            handleProceed={a => this.answerQuestion('bornInBoston', a)}
            handleStepBack={this.stepBackOneQuestion}
            handleUserReset={this.handleUserReset}
          />
        )}

        {currentStep === 'personalInformation' && (
          <PersonalInformation
            {...answers}
            handleStepCompletion={setCurrentStepCompleted}
            handleProceed={a => this.answerQuestion('personalInformation', a)}
            handleStepBack={this.stepBackOneQuestion}
          />
        )}

        {currentStep === 'parentalInformation' && (
          <ParentalInformation
            {...answers}
            handleStepCompletion={setCurrentStepCompleted}
            handleProceed={a => this.answerQuestion('parentalInformation', a)}
            handleStepBack={this.stepBackOneQuestion}
            verificationStepRequired={
              this.props.birthCertificateRequest.verificationStepRequired
            }
          />
        )}

        {currentStep === 'verifyIdentification' && (
          <VerifyIdentification
            handleStepCompletion={setCurrentStepCompleted}
            handleProceed={a =>
              // todo: remove “as any” once file upload details are sorted.
              this.answerQuestion('verifyIdentification', a as any)
            }
            handleStepBack={this.stepBackOneQuestion}
          />
        )}
      </PageWrapper>
    );
  }
}
