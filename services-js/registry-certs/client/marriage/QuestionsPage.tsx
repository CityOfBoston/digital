import React from 'react';

import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { ContactForm } from '@cityofboston/react-fleet';

import { PageDependencies, GetInitialProps } from '../../pages/_app';

import { MarriageStep } from '../types';

import MarriageCertificateRequest, {
  QUESTION_STEPS,
} from '../store/MarriageCertificateRequest';

import PageWrapper from '../PageWrapper';

import ForWhom from './questions/ForWhom';
import ClientInstructions from './questions/ClientInstructions';
import FiledInBoston from './questions/FiledInBoston';
import DateOfMarriage from './questions/DateOfMarriage';
import PersonOnRecord from './questions/PersonOnRecord';
import VerifyIdentification from './questions/VerifyIdentification';

interface InitialProps {
  currentStep: MarriageStep;
}

interface Props
  extends InitialProps,
    Pick<PageDependencies, 'marriageCertificateRequest'> {}

interface State {
  /**
   * This is a clone of the request that we can modify locally. Lets us use its
   * @calculated helpers to drive the UI while making sure we only modify the
   * actual request when the user clicks "Next".
   */
  localMarriageCertificateRequest: MarriageCertificateRequest;
  /**
   * Stored reference to the Prop marriageCertificateRequest, used to detect props
   * changes.
   */
  globalMarriageCertificateRequest: MarriageCertificateRequest;
  /**
   * Saved here so that getDerivedStateFromProps knows when we switch pages. (It
   * doesn’t receive prevProps.)
   */
  currentStep: MarriageStep;
}

/**
 * Guides the user through a number of questions, step by step, in order to
 * provide the Registry with the information they will need to locate the
 * marriage record.
 *
 * User will progress to /review upon completion of this workflow.
 *
 * Much of this is copied/adapted from birth/QuestionsPage.tsx
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
      res.writeHead(302, { Location: '/marriage' });
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
      currentStep: (query['step'] as MarriageStep) || QUESTION_STEPS[0],
    };
  };

  // We cast this lifecycle event to any because the @observer type
  // signature is not compatible with using Props / State type annotations
  static getDerivedStateFromProps: any = (
    props: Readonly<Props>,
    state: Readonly<State>
  ): Partial<State> | null => {
    // When the step changes we create a new clone of the request for us to play
    // with. We’ll update the original, global request when the user submits.
    //
    // We also are sensitive to the prop marriage certificate request changing,
    // which can happen when it’s restored from session storage.
    if (
      props.currentStep !== state.currentStep ||
      props.marriageCertificateRequest !==
        state.globalMarriageCertificateRequest
    ) {
      return {
        currentStep: props.currentStep,
        localMarriageCertificateRequest: props.marriageCertificateRequest.clone(),
        globalMarriageCertificateRequest: props.marriageCertificateRequest,
      };
    } else {
      return null;
    }
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      localMarriageCertificateRequest: props.marriageCertificateRequest.clone(),
      globalMarriageCertificateRequest: props.marriageCertificateRequest,
      currentStep: props.currentStep,
    };
  }

  componentDidMount() {
    window.scroll(0, 0);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentStep !== this.props.currentStep) {
      window.scroll(0, 0);
    }
  }

  private advanceQuestion = (modifiedRequest: MarriageCertificateRequest) => {
    const { currentStep, marriageCertificateRequest } = this.props;

    if (marriageCertificateRequest !== modifiedRequest) {
      marriageCertificateRequest.updateFrom(modifiedRequest);
    }

    // Have to do this after updateFrom because the answers to questions can
    // affect the steps.
    const newSteps = marriageCertificateRequest.steps;
    const currentIndex = newSteps.indexOf(currentStep);

    if (currentIndex < 0) {
      throw new Error(`Step ${currentStep} not found in new steps`);
    }

    const nextStep = newSteps[currentIndex + 1];

    if (nextStep === 'reviewRequest') {
      Router.push('/marriage/review');
    } else {
      Router.push(`/marriage?step=${nextStep}`);
    }
  };

  private stepBackOneQuestion = (): void => {
    const {
      marriageCertificateRequest: { steps },
      currentStep,
    } = this.props;
    const currentIndex = steps.indexOf(currentStep);

    // Ensure we cannot go back any further than the first question.
    const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;

    Router.push(`/marriage?step=${steps[newIndex]}`);
  };

  // Clear all data and return to initial question.
  private handleUserReset = (): void => {
    this.props.marriageCertificateRequest.clearCertificateRequest();
  };

  render() {
    const { currentStep, marriageCertificateRequest } = this.props;
    const { localMarriageCertificateRequest } = this.state;

    let isStepComplete: boolean = false;
    let questionsEl: React.ReactNode = null;

    const { steps } = localMarriageCertificateRequest;

    switch (currentStep) {
      case 'forWhom':
        isStepComplete = ForWhom.isComplete(localMarriageCertificateRequest);
        questionsEl = (
          <ForWhom
            marriageCertificateRequest={localMarriageCertificateRequest}
            handleProceed={this.advanceQuestion.bind(
              this,
              localMarriageCertificateRequest
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

      case 'filedInBoston':
        isStepComplete = FiledInBoston.isComplete(
          localMarriageCertificateRequest
        );
        questionsEl = (
          <FiledInBoston
            marriageCertificateRequest={localMarriageCertificateRequest}
            handleProceed={this.advanceQuestion.bind(
              this,
              localMarriageCertificateRequest
            )}
            handleStepBack={this.stepBackOneQuestion}
            handleUserReset={this.handleUserReset}
          />
        );
        break;

      case 'dateOfMarriage':
        isStepComplete = DateOfMarriage.isComplete(
          localMarriageCertificateRequest
        );
        questionsEl = (
          <DateOfMarriage
            marriageCertificateRequest={localMarriageCertificateRequest}
            handleProceed={this.advanceQuestion.bind(
              this,
              localMarriageCertificateRequest
            )}
            handleStepBack={this.stepBackOneQuestion}
          />
        );
        break;

      case 'personOnRecord1':
        isStepComplete = PersonOnRecord.isComplete(
          'person1',
          localMarriageCertificateRequest
        );
        questionsEl = (
          <PersonOnRecord
            person="person1"
            marriageCertificateRequest={localMarriageCertificateRequest}
            handleProceed={this.advanceQuestion.bind(
              this,
              localMarriageCertificateRequest
            )}
            handleStepBack={this.stepBackOneQuestion}
          />
        );
        break;

      case 'personOnRecord2':
        isStepComplete = PersonOnRecord.isComplete(
          'person2',
          localMarriageCertificateRequest
        );
        questionsEl = (
          <PersonOnRecord
            person="person2"
            marriageCertificateRequest={localMarriageCertificateRequest}
            handleProceed={this.advanceQuestion.bind(
              this,
              localMarriageCertificateRequest
            )}
            handleStepBack={this.stepBackOneQuestion}
          />
        );
        break;

      case 'verifyIdentification':
        // We just don’t dynamically update the progress bar for uploads right now
        isStepComplete = false;

        // This is given the actual marriage certificate request, rather than the local
        // clone, because we’re uploading photos directly to the server. Therefore
        // we don’t want to require “submit” to store a record of the uploads. If you
        // upload and then press “back”, when you get back to this page the uploads
        // need to still be there.
        questionsEl = (
          <VerifyIdentification
            marriageCertificateRequest={marriageCertificateRequest}
            handleProceed={this.advanceQuestion.bind(
              this,
              marriageCertificateRequest
            )}
            handleStepBack={this.stepBackOneQuestion}
          />
        );
        break;
    }

    return (
      <PageWrapper
        certificateType="marriage"
        progress={{
          totalSteps: steps.length,
          currentStep: steps.indexOf(currentStep) + 1,
          currentStepCompleted: isStepComplete,
        }}
      >
        <Head>
          <title>Boston.gov — Request a Marriage Certificate</title>
        </Head>

        {questionsEl}

        <div className="m-v700 ta-c">
          Questions? Email the Registry Department at{' '}
          <a
            href="mailto:marriage@boston.gov"
            onClick={ContactForm.makeMailtoClickHandler(
              'marriage-cert-feedback-form'
            )}
          >
            marriage@boston.gov
          </a>
          .
        </div>
      </PageWrapper>
    );
  }
}
