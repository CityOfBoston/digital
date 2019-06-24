import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { PageDependencies, GetInitialProps } from '../../pages/_app';

import { BirthStep } from '../types';

import BirthCertificateRequest, {
  QUESTION_STEPS,
} from '../store/BirthCertificateRequest';

import PageWrapper from '../PageWrapper';

import ForWhom from './questions/ForWhom';
import BornInBoston from './questions/BornInBoston';
import PersonalInformation from './questions/PersonalInformation';
import PersonOnRecord from './questions/ParentalInformation';
import VerifyIdentification from './questions/VerifyIdentification';
import ClientInstructions from './questions/ClientInstructions';
import { ContactForm } from '@cityofboston/react-fleet';

interface InitialProps {
  currentStep: BirthStep;
}

interface Props
  extends InitialProps,
    Pick<PageDependencies, 'birthCertificateRequest' | 'siteAnalytics'> {}

interface State {
  /**
   * This is a clone of the request that we can modify locally. Lets us use its
   * @calculated helpers to drive the UI while making sure we only modify the
   * actual request when the user clicks "Next".
   */
  localBirthCertificateRequest: BirthCertificateRequest;
  /**
   * Stored reference to the Prop birthCertificateRequest, used to detect props
   * changes.
   */
  globalBirthCertificateRequest: BirthCertificateRequest;
  /**
   * Saved here so that getDerivedStateFromProps knows when we switch pages. (It
   * doesn’t receive prevProps.)
   */
  currentStep: BirthStep;
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
      currentStep: (query['step'] as BirthStep) || QUESTION_STEPS[0],
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
    //
    // We also are sensitive to the prop birth certificate request changing,
    // which can happen when it’s restored from session storage.
    if (
      props.currentStep !== state.currentStep ||
      props.birthCertificateRequest !== state.globalBirthCertificateRequest
    ) {
      return {
        currentStep: props.currentStep,
        localBirthCertificateRequest: props.birthCertificateRequest.clone(),
        globalBirthCertificateRequest: props.birthCertificateRequest,
      };
    } else {
      return null;
    }
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      localBirthCertificateRequest: props.birthCertificateRequest.clone(),
      globalBirthCertificateRequest: props.birthCertificateRequest,
      currentStep: props.currentStep,
    };
  }

  componentDidMount() {
    if (process.env.NODE_ENV !== 'test') {
      window.scroll(0, 0);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentStep !== this.props.currentStep) {
      if (process.env.NODE_ENV !== 'test') {
        window.scroll(0, 0);
      }
    }
  }

  private advanceQuestion = (modifiedRequest: BirthCertificateRequest) => {
    const { currentStep, birthCertificateRequest } = this.props;

    if (birthCertificateRequest !== modifiedRequest) {
      birthCertificateRequest.updateFrom(modifiedRequest);
    }

    // Have to do this after updateFrom because the answers to questions can
    // affect the steps.
    const newSteps = birthCertificateRequest.steps;
    const currentIndex = newSteps.indexOf(currentStep);

    if (currentIndex < 0) {
      throw new Error(`Step ${currentStep} not found in new steps`);
    }

    const nextStep = newSteps[currentIndex + 1];

    this.gaEventActionAndLabel();

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

  // Determine correct GA Action and Label for the events to be sent during
  // each step in the questions flow.
  private gaEventActionAndLabel = (): void => {
    const { currentStep } = this.props;
    const { requestInformation } = this.props.birthCertificateRequest;
    const {
      bornInBoston,
      parentsLivedInBoston,
      parentsMarried,
      birthDate,
    } = requestInformation;

    if (currentStep === 'forWhom') {
      this.gaAnswerQuestion('ordering for', orderingFor(requestInformation));
    } else if (currentStep === 'bornInBoston') {
      this.gaAnswerQuestion('born in Boston', bornInBoston);

      if (parentsLivedInBoston && parentsLivedInBoston.length > 0) {
        this.gaAnswerQuestion('parents lived in Boston', parentsLivedInBoston);
      }
    } else if (currentStep === 'personalInformation' && birthDate) {
      this.gaAnswerQuestion(
        'birth year',
        birthDate.getUTCFullYear().toString()
      );
    } else if (currentStep === 'parentalInformation') {
      this.gaAnswerQuestion('parents married', parentsMarried);
    }

    function orderingFor(requestInformation): string {
      const { forSelf, howRelated } = requestInformation;

      if (forSelf) {
        return 'self';
      } else {
        return howRelated as string;
      }
    }
  };

  gaAnswerQuestion = (action: string, label: string): void => {
    this.props.siteAnalytics.sendEvent(action, {
      category: 'Birth',
      label,
    });
  };

  // Clear all data and return to initial question.
  private handleUserReset = (): void => {
    this.props.birthCertificateRequest.clearCertificateRequest();
  };

  render() {
    const { currentStep, birthCertificateRequest } = this.props;
    const { localBirthCertificateRequest } = this.state;

    let isStepComplete: boolean = false;
    let questionsEl: React.ReactNode = null;

    switch (currentStep) {
      case 'forWhom':
        isStepComplete = ForWhom.isComplete(localBirthCertificateRequest);
        questionsEl = (
          <ForWhom
            birthCertificateRequest={localBirthCertificateRequest}
            handleProceed={this.advanceQuestion.bind(
              this,
              localBirthCertificateRequest
            )}
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
            handleProceed={this.advanceQuestion.bind(
              this,
              localBirthCertificateRequest
            )}
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
            handleProceed={this.advanceQuestion.bind(
              this,
              localBirthCertificateRequest
            )}
            handleStepBack={this.stepBackOneQuestion}
          />
        );
        break;

      case 'parentalInformation':
        isStepComplete = PersonOnRecord.isComplete(
          localBirthCertificateRequest
        );
        questionsEl = (
          <PersonOnRecord
            birthCertificateRequest={localBirthCertificateRequest}
            handleProceed={this.advanceQuestion.bind(
              this,
              localBirthCertificateRequest
            )}
            handleStepBack={this.stepBackOneQuestion}
          />
        );
        break;

      case 'verifyIdentification':
        // We just don't dynamically update the progress bar for uploads right now
        isStepComplete = false;

        // This is given the actual birth certificate request, rather than the local
        // clone, because we’re uploading photos directly to the server. Therefore
        // we don't want to require "submit" to store a record of the uploads. If you
        // upload and then press back, when you get back to this page the uploads
        // need to still be there.
        questionsEl = (
          <VerifyIdentification
            siteAnalytics={this.props.siteAnalytics}
            birthCertificateRequest={birthCertificateRequest}
            handleProceed={this.advanceQuestion.bind(
              this,
              birthCertificateRequest
            )}
            handleStepBack={this.stepBackOneQuestion}
          />
        );
        break;
    }

    const { steps } = localBirthCertificateRequest;

    return (
      <PageWrapper
        certificateType="birth"
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

        <div className="m-v700 ta-c">
          Questions? Email the Registry Department at{' '}
          <a
            href="mailto:birth@boston.gov"
            onClick={ContactForm.makeMailtoClickHandler(
              'birth-cert-feedback-form'
            )}
          >
            birth@boston.gov
          </a>
          .
        </div>
      </PageWrapper>
    );
  }
}
