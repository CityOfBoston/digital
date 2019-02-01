import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { PageDependencies, GetInitialProps } from '../../pages/_app';

import { Step } from '../types';

import BirthCertificateRequest, {
  QUESTION_STEPS,
} from '../store/BirthCertificateRequest';

import PageWrapper from './PageWrapper';

import ForWhom from './questions/ForWhom';
import BornInBoston from './questions/BornInBoston';
import PersonalInformation from './questions/PersonalInformation';
import ParentalInformation from './questions/ParentalInformation';
import VerifyIdentification from './questions/VerifyIdentification';
import ClientInstructions from './questions/ClientInstructions';

interface InitialProps {
  currentStep: Step;
}

interface Props
  extends InitialProps,
    Pick<PageDependencies, 'birthCertificateRequest'> {}

interface State {
  /**
   * This is a clone of the request that we can modify locally. Lets us use its
   * @calculated helpers to drive the UI while making sure we only modify the
   * actual request when the user clicks "Next".
   */
  localBirthCertificateRequest: BirthCertificateRequest;
  /**
   * Saved here so that getDerivedStateFromProps knows when we switch pages. (It
   * doesn’t receive prevProps.)
   */
  currentStep: Step;
}
/**
 * Guides the user through a number of questions, step by step, in order to
 * provide the Registry with the information they will need to locate the
 * birth record.
 *
 * User will progress to /review upon completion of this workflow.
 */
@observer
export default class QuestionsPage extends React.Component<Props, State> {
  static getInitialProps: GetInitialProps<InitialProps, 'query' | 'res'> = ({
    res,
    query,
  }) => {
    // We only allow the first step for server-side rendering. This means
    // that we don’t have to accommodate someone manually changing the
    // URL to a step ahead of what they’ve filled out.
    if (res && query['step']) {
      res.writeHead(302, { Location: '/birth' });
      res.end();

      // Need to return something for type safety, but Next.js will halt
      // rendering once it sees that the response has been written.
      return {
        currentStep: QUESTION_STEPS[0],
      };
    }
    return {
      // if the "step" parameter isn't a valid Step we just render a blank page,
      // which isn’t a big deal.
      currentStep: (query['step'] as Step) || QUESTION_STEPS[0],
    };
  };

  // We cast this lifecycle event to any because the @observer type
  // signature is not compatible with using Props / State type annotations
  static getDerivedStateFromProps: any = (
    props: Readonly<Props>,
    state: Readonly<State>
  ): Partial<State> | null => {
    // When the step changes we create a new clone of the request for us to play
    // with. We'll update the original, global request when the user submits.
    if (props.currentStep !== state.currentStep) {
      return {
        currentStep: props.currentStep,
        localBirthCertificateRequest: props.birthCertificateRequest.clone(),
      };
    } else {
      return null;
    }
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      localBirthCertificateRequest: props.birthCertificateRequest.clone(),
      currentStep: props.currentStep,
    };
  }

  componentDidMount() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentStep !== this.props.currentStep) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }

  private advanceQuestion = () => {
    const { currentStep, birthCertificateRequest } = this.props;
    const { localBirthCertificateRequest } = this.state;

    birthCertificateRequest.updateFrom(localBirthCertificateRequest);

    // Have to do this after updateFrom because the answers to questions can
    // affect the steps.
    const newSteps = birthCertificateRequest.steps;
    const currentIndex = newSteps.indexOf(currentStep);

    if (currentIndex < 0) {
      throw new Error(`Step ${currentStep} not found in new steps`);
    }

    const nextStep = newSteps[currentIndex + 1];

    if (nextStep === 'reviewRequest') {
      Router.push('/birth/review');
    } else {
      Router.push(`/birth?step=${nextStep}`);
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
    const { currentStep } = this.props;
    const { localBirthCertificateRequest } = this.state;

    let isStepComplete: boolean = false;
    let questionsEl: React.ReactNode = null;

    switch (currentStep) {
      case 'forWhom':
        isStepComplete = ForWhom.isComplete(localBirthCertificateRequest);
        questionsEl = (
          <ForWhom
            birthCertificateRequest={localBirthCertificateRequest}
            handleProceed={this.advanceQuestion}
          />
        );
        break;

      case 'clientInstructions':
        isStepComplete = true;
        questionsEl = (
          <ClientInstructions handleStepBack={this.stepBackOneQuestion} />
        );
        break;

      case 'bornInBoston':
        isStepComplete = BornInBoston.isComplete(localBirthCertificateRequest);
        questionsEl = (
          <BornInBoston
            birthCertificateRequest={localBirthCertificateRequest}
            handleProceed={this.advanceQuestion}
            handleStepBack={this.stepBackOneQuestion}
            handleUserReset={this.handleUserReset}
          />
        );
        break;

      case 'personalInformation':
        isStepComplete = PersonalInformation.isComplete(
          localBirthCertificateRequest
        );
        questionsEl = (
          <PersonalInformation
            birthCertificateRequest={localBirthCertificateRequest}
            handleProceed={this.advanceQuestion}
            handleStepBack={this.stepBackOneQuestion}
          />
        );
        break;

      case 'parentalInformation':
        isStepComplete = ParentalInformation.isComplete(
          localBirthCertificateRequest
        );
        questionsEl = (
          <ParentalInformation
            birthCertificateRequest={localBirthCertificateRequest}
            handleProceed={this.advanceQuestion}
            handleStepBack={this.stepBackOneQuestion}
          />
        );
        break;

      case 'verifyIdentification':
        isStepComplete = false;
        questionsEl = (
          <VerifyIdentification
            birthCertificateRequest={localBirthCertificateRequest}
            handleProceed={this.advanceQuestion}
            handleStepBack={this.stepBackOneQuestion}
          />
        );
        break;
    }

    const { steps } = localBirthCertificateRequest;

    return (
      <PageWrapper
        progress={{
          totalSteps: steps.length,
          currentStep: steps.indexOf(currentStep) + 1,
          currentStepCompleted: isStepComplete,
        }}
      >
        <Head>
          <title>Boston.gov — Request a Birth Certificate</title>
        </Head>

        {questionsEl}
      </PageWrapper>
    );
  }
}