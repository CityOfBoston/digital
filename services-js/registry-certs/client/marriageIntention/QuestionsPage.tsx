import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { PageDependencies, GetInitialProps } from '../../pages/_app';

import {
  MarriageIntentionStep,
  /*MarriageIntentionCertificateRequestInformation,*/
} from '../types';

import MarriageIntentionCertificateRequest, {
  QUESTION_STEPS,
} from '../store/MarriageIntentionCertificateRequest';

import PageWrapper from '../PageWrapper';

import Disclaimer from './questions/Disclaimer';

// UI
// import { ContactForm } from '@cityofboston/react-fleet';

interface InitialProps {
  currentStep: MarriageIntentionStep;
}

interface Props
  extends InitialProps,
    Pick<
      PageDependencies,
      'marriageIntentionCertificateRequest' | 'siteAnalytics'
    > {}

interface State {
  /**
   * This is a clone of the request that we can modify locally. Lets us use its
   * @calculated helpers to drive the UI while making sure we only modify the
   * actual request when the user clicks "Next".
   */
  localMarriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  /**MarriageIntention
   * Stored reference to the Prop marriageIntentionCertificateRequest, used to detect props
   * changes.
   */
  globalMarriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  /**
   * Saved here so that getDerivedStateFromProps knows when we switch pages. (It
   * doesn’t receive prevProps.)
   */
  currentStep: MarriageIntentionStep;
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
      currentStep:
        (query['step'] as MarriageIntentionStep) || QUESTION_STEPS[0],
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
      props.marriageIntentionCertificateRequest !==
        state.globalMarriageIntentionCertificateRequest
    ) {
      return {
        currentStep: props.currentStep,
        localMarriageIntentionCertificateRequest: props.marriageIntentionCertificateRequest.clone(),
        globalMarriageIntentionCertificateRequest:
          props.marriageIntentionCertificateRequest,
      };
    } else {
      return null;
    }
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      localMarriageIntentionCertificateRequest: props.marriageIntentionCertificateRequest.clone(),
      globalMarriageIntentionCertificateRequest:
        props.marriageIntentionCertificateRequest,
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

  private advanceQuestion = (
    modifiedRequest: MarriageIntentionCertificateRequest
  ) => {
    const { currentStep, marriageIntentionCertificateRequest } = this.props;

    if (marriageIntentionCertificateRequest !== modifiedRequest) {
      marriageIntentionCertificateRequest.updateFrom(modifiedRequest);
    }

    // Have to do this after updateFrom because the answers to questions can
    // affect the steps.
    const newSteps = marriageIntentionCertificateRequest.steps;
    const currentIndex = newSteps.indexOf(currentStep);

    if (currentIndex < 0) {
      throw new Error(`Step ${currentStep} not found in new steps`);
    }

    const nextStep = newSteps[currentIndex + 1];

    this.gaEventActionAndLabel();

    if (nextStep === 'reviewForm') {
      Router.push('/marriageIntention/review');
    } else {
      Router.push(`/marriageIntention?step=${nextStep}`);
    }
  };

  // private stepBackOneQuestion = (): void => {
  //   const {
  //     marriageIntentionCertificateRequest: { steps },
  //     currentStep,
  //   } = this.props;
  //   const currentIndex = steps.indexOf(currentStep);

  //   // Ensure we cannot go back any further than the first question.
  //   const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;

  //   Router.push(`/marriageIntention?step=${steps[newIndex]}`);
  // };

  // Determine correct GA Action and Label for the events to be sent during
  // each step in the questions flow.
  private gaEventActionAndLabel = (): void => {};

  gaAnswerQuestion = (action: string, label: string): void => {
    this.props.siteAnalytics.sendEvent(action, {
      category: 'MarriageIntention',
      label,
    });
  };

  // Clear all data and return to initial question.
  // private handleUserReset = (): void => {
  //   this.props.marriageIntentionCertificateRequest.clearCertificateRequest();
  // };

  render() {
    const {
      currentStep,
      /*marriageIntentionCertificateRequest*/
    } = this.props;
    const { localMarriageIntentionCertificateRequest } = this.state;

    let isStepComplete: boolean = false;
    let questionsEl: React.ReactNode = null;
    switch (currentStep) {
      case 'disclaimer':
        isStepComplete = Disclaimer.isComplete(
          localMarriageIntentionCertificateRequest
        );
        questionsEl = (
          <Disclaimer
            marriageIntentionCertificateRequest={
              localMarriageIntentionCertificateRequest
            }
            handleProceed={this.advanceQuestion.bind(
              this,
              localMarriageIntentionCertificateRequest
            )}
          />
        );
        break;
      default:
        isStepComplete = Disclaimer.isComplete(
          localMarriageIntentionCertificateRequest
        );
        questionsEl = (
          <Disclaimer
            marriageIntentionCertificateRequest={
              localMarriageIntentionCertificateRequest
            }
            handleProceed={this.advanceQuestion.bind(
              this,
              localMarriageIntentionCertificateRequest
            )}
          />
        );
        break;
    }

    const { steps } = localMarriageIntentionCertificateRequest;

    return (
      <PageWrapper
        certificateType="marriageIntention"
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
