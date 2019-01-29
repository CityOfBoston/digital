import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { PageDependencies, GetInitialProps } from '../../pages/_app';

import PageWrapper from './PageWrapper';

import ForWhom from './questions/ForWhom';
import BornInBoston from './questions/BornInBoston';
import PersonalInformation from './questions/PersonalInformation';
import ParentalInformation from './questions/ParentalInformation';
import VerifyIdentification from './questions/VerifyIdentification';

import { BirthCertificateRequestInformation, Step } from '../types';
import { DEFAULT_STEPS } from '../store/BirthCertificateRequest';

interface InitialProps {
  currentStep: Step;
}

interface Props
  extends InitialProps,
    Pick<PageDependencies, 'birthCertificateRequest'> {}

/**
 * Guides the user through a number of questions, step by step, in order to
 * provide the Registry with the information they will need to locate the
 * birth record.
 *
 * User will progress to /review upon completion of this workflow.
 */
@observer
export default class QuestionsPage extends React.Component<Props> {
  static getInitialProps: GetInitialProps<InitialProps, 'query' | 'res'> = ({
    res,
    query,
  }) => {
    // The lookup into DEFAULT_STEPS ensures that we get an actual step.
    const currentStepIndex = DEFAULT_STEPS.indexOf(
      (query['step'] as any) || DEFAULT_STEPS[0]
    );

    // We only allow the first step for server-side rendering. This means
    // that we don’t have to accommodate someone manually changing the
    // URL to a step ahead of what they’ve filled out.
    if (res && currentStepIndex !== 0) {
      res.writeHead(302, { Location: '/birth' });
      res.end();

      // Need to return something for type safety, but Next.js will halt
      // rendering once it sees that the response has been written.
      return {
        currentStep: DEFAULT_STEPS[0],
      };
    }

    if (currentStepIndex === -1) {
      throw new Error(`Unknown step ${query['step']}`);
    }

    return {
      currentStep: DEFAULT_STEPS[currentStepIndex],
    };
  };

  componentDidMount() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentStep !== this.props.currentStep) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }

  private answerQuestion = (
    question: Step,
    answers: Partial<BirthCertificateRequestInformation>
  ): void => {
    const { answerQuestion, steps } = this.props.birthCertificateRequest;
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
      Router.push(`/birth?step=${steps[currentIndex + 1]}`);
    }
  };

  private stepBackOneQuestion = (): void => {
    const {
      birthCertificateRequest: { steps },
      currentStep,
    } = this.props;
    const currentIndex = steps.indexOf(currentStep);

    // Ensure we cannot go back any further than the first question.
    const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    Router.push(`/birth?step=${steps[newIndex]}`);
  };

  // Clear all data and return to initial question.
  private handleUserReset = (): void => {
    this.props.birthCertificateRequest.clearBirthCertificateRequest();
  };

  public render() {
    const {
      birthCertificateRequest: {
        requestInformation: answers,
        steps,
        currentStepCompleted,
        setCurrentStepCompleted,
      },
      currentStep,
    } = this.props;

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
