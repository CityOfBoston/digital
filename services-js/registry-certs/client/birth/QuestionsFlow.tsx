import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { PageDependencies } from '../../pages/_app';

import PageLayout from '../PageLayout';
import BirthCertificateRequestHeader from './BirthCertificateRequestHeader';

import ForWhom from './questions/ForWhom';
import BornInBoston from './questions/BornInBoston';
import PersonalInformation from './questions/PersonalInformation';
import ParentalInformation from './questions/ParentalInformation';

import { BIRTH_BREADCRUMB_NAV_LINKS, STEPS } from './constants';
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
export default class QuestionsFlow extends React.Component<Props> {
  private answerQuestion = (
    question: Step,
    answers: Partial<BirthCertificateRequestInformation>
  ): void => {
    const {
      answerQuestion,
      setCurrentStep,
    } = this.props.birthCertificateRequest;
    const currentIndex = STEPS.indexOf(question);

    if (question === 'forWhom') {
      answerQuestion({
        ...answers,
        forSelf: answers.forSelf === ('true' as any),
      });
    } else {
      answerQuestion(answers);
    }

    if (question === 'parentalInformation') {
      Router.push('/birth/review');
    } else {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  private stepBackOneQuestion = (): void => {
    const { currentStep, setCurrentStep } = this.props.birthCertificateRequest;
    const currentIndex = STEPS.indexOf(currentStep);

    // Ensure we cannot go back any further than the first question.
    const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;

    setCurrentStep(STEPS[newIndex]);
  };

  // Clear all data and return to initial question.
  private handleUserReset = (): void => {
    this.props.birthCertificateRequest.clearBirthCertificateRequest();
  };

  public render() {
    const answers = this.props.birthCertificateRequest.requestInformation;
    const {
      currentStep,
      currentStepCompleted,
      setCurrentStepCompleted,
    } = this.props.birthCertificateRequest;

    return (
      <>
        <Head>
          <title>Boston.gov — Birth Certificates</title>
        </Head>

        <PageLayout breadcrumbNav={BIRTH_BREADCRUMB_NAV_LINKS}>
          <div className="b-c b-c--nbp" aria-live="polite">
            <BirthCertificateRequestHeader
              currentStep={STEPS.indexOf(currentStep) + 1}
              stepComplete={currentStepCompleted}
            />

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
                forSelf={answers.forSelf}
                parentsLivedInBoston={answers.parentsLivedInBoston}
                bornInBoston={answers.bornInBoston}
                handleStepCompletion={setCurrentStepCompleted}
                handleProceed={a => this.answerQuestion('bornInBoston', a)}
                handleStepBack={this.stepBackOneQuestion}
                handleUserReset={this.handleUserReset}
              />
            )}

            {currentStep === 'personalInformation' && (
              <PersonalInformation
                forSelf={answers.forSelf}
                firstName={answers.firstName}
                lastName={answers.lastName}
                altSpelling={answers.altSpelling}
                birthDate={answers.birthDate}
                handleStepCompletion={setCurrentStepCompleted}
                handleProceed={a =>
                  this.answerQuestion('personalInformation', a)
                }
                handleStepBack={this.stepBackOneQuestion}
              />
            )}

            {currentStep === 'parentalInformation' && (
              <ParentalInformation
                forSelf={answers.forSelf}
                firstName={answers.firstName}
                parent1FirstName={answers.parent1FirstName}
                parent1LastName={answers.parent1LastName}
                parent2FirstName={answers.parent2FirstName}
                parent2LastName={answers.parent2LastName}
                parentsMarried={answers.parentsMarried}
                handleStepCompletion={setCurrentStepCompleted}
                handleProceed={a =>
                  this.answerQuestion('parentalInformation', a)
                }
                handleStepBack={this.stepBackOneQuestion}
              />
            )}
          </div>
        </PageLayout>
      </>
    );
  }
}
