/** @jsx jsx */

import { jsx } from '@emotion/core';
import React from 'react';
import Head from 'next/head';
import Router from 'next/router';

import { observer } from 'mobx-react';

import { PageDependencies, GetInitialProps } from '../../pages/_app';

import { MarriageIntentionStep } from '../types';

import MarriageIntentionCertificateRequest, {
  QUESTION_STEPS,
} from '../store/MarriageIntentionCertificateRequest';

import PageWrapper from '../PageWrapper';

import { INTENTION } from './styling';

import { ContactForm } from '@cityofboston/react-fleet';
import StatusModal from '../StatusModal';

import Instructions from './forms/instructions';
import PartnerFormA from './forms/partnerFormA';
import PartnerFormB from './forms/partnerFormB';
import ReviewForms from './forms/reviewForms';
import ContactInfo from './forms/contactInfo';
import Receipt from './forms/receipt';

import { isPartnerFormPageComplete } from '../marriageintention/helpers/formUtils';

interface InitialProps {
  currentStep: MarriageIntentionStep;
}

interface Props
  extends InitialProps,
    Pick<
      PageDependencies,
      | 'marriageIntentionCertificateRequest'
      | 'siteAnalytics'
      | 'marriageIntentionDao'
      | 'completedSteps'
    > {}

interface State {
  /**
   * This is a clone of the request that we can modify locally. Lets us use its
   * @calculated helpers to drive the UI while making sure we only modify the
   * actual request when the user clicks "Next".
   */
  localMarriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  /**
   * Stored reference to the Prop marriageIntentionCertificateRequest, used to detect props
   * changes.
   */
  globalMarriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  /**
   * Saved here so that getDerivedStateFromProps knows when we switch pages. (It
   * doesn’t receive prevProps.)
   */
  currentStep: MarriageIntentionStep;
  completedSteps: Set<number>;
  allowProceed: boolean;
  errorElemSrc: object;
  backTrackingDisclaimer: boolean;
  showDisclaimer: boolean;
  contactFormComplete: boolean;
}

/**
 * Guides the user through a number of questions, step by step, in order to
 * provide the Registry with the information they will need to locate the
 * birth record.
 *
 * User will progress to /review upon completion of this workflow.
 */
@observer
export default class IndexPage extends React.Component<Props, State> {
  static getInitialProps: GetInitialProps<InitialProps, 'query' | 'res'> = ({
    res,
    query,
  }) => {
    // We only allow the first step for server-side rendering. This means
    // that we don’t have to accommodate someone manually changing the
    // URL to a step ahead of what they’ve filled out.
    if (res && query['step']) {
      res.writeHead(302, { Location: '/marriageintention' });
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
  // REFs Def
  partnerA_nameFieldsRef: React.RefObject<HTMLSpanElement>;
  partnerA_residenceRef: React.RefObject<HTMLSpanElement>;
  partnerA_marriageRef: React.RefObject<HTMLSpanElement>;
  partnerA_datePlaceOfBirthRef: React.RefObject<HTMLSpanElement>;
  partnerA_parentsRef: React.RefObject<HTMLSpanElement>;

  partnerB_nameFieldsRef: React.RefObject<HTMLSpanElement>;
  partnerB_residenceRef: React.RefObject<HTMLSpanElement>;
  partnerB_marriageRef: React.RefObject<HTMLSpanElement>;
  partnerB_datePlaceOfBirthRef: React.RefObject<HTMLSpanElement>;
  partnerB_parentsRef: React.RefObject<HTMLSpanElement>;

  constructor(props: Props) {
    super(props);

    // STATE
    this.state = {
      localMarriageIntentionCertificateRequest: props.marriageIntentionCertificateRequest.clone(),
      globalMarriageIntentionCertificateRequest:
        props.marriageIntentionCertificateRequest,
      currentStep: props.currentStep,
      completedSteps: this.props.completedSteps || new Set([0]),
      allowProceed: true,
      errorElemSrc: {},
      backTrackingDisclaimer: false,
      showDisclaimer: false,
      contactFormComplete: false,
    };

    // REFs Inits
    this.partnerA_nameFieldsRef = React.createRef();
    this.partnerA_residenceRef = React.createRef();
    this.partnerA_marriageRef = React.createRef();
    this.partnerA_datePlaceOfBirthRef = React.createRef();
    this.partnerA_parentsRef = React.createRef();

    this.partnerB_nameFieldsRef = React.createRef();
    this.partnerB_residenceRef = React.createRef();
    this.partnerB_marriageRef = React.createRef();
    this.partnerB_datePlaceOfBirthRef = React.createRef();
    this.partnerB_parentsRef = React.createRef();
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

  // Determine correct GA Action and Label for the events to be sent during
  // each step in the questions flow.
  private gaEventActionAndLabel = (): void => {
    const { currentStep } = this.props;

    switch (currentStep) {
      case 'partnerFormA':
        this.gaAnswerQuestion('Completed ', 'partnerFormA');
        break;
      case 'partnerFormB':
        this.gaAnswerQuestion('Completed ', 'partnerFormB');
        break;
      case 'contactInfo':
        this.gaAnswerQuestion('Completed ', 'contactInfo');
        break;
      case 'reviewForms':
        this.gaAnswerQuestion('Completed ', 'reviewForms');
        break;
      case 'reviewRequest':
        this.gaAnswerQuestion('Completed ', 'reviewRequest');
        break;
      default:
        break;
    }
  };

  gaAnswerQuestion = (action: string, label: string): void => {
    this.props.siteAnalytics.sendEvent(action, {
      category: 'MarriageIntention',
      label,
    });
  };

  private submitRequest = async (
    modifiedRequest: MarriageIntentionCertificateRequest
  ) => {
    // DIG-2105
    const { marriageIntentionDao } = this.props;

    try {
      // DIG-2105
      await marriageIntentionDao.submitMarriageIntentionCertificateRequest(
        modifiedRequest
      );

      // DIG-2105
      this.advanceQuestion(modifiedRequest);
    } catch (e) {
      if ((window as any).Rollbar) {
        (window as any).Rollbar.error(e);
      }

      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  // Clear all data and return to initial question.
  private handleUserReset = (): void => {
    this.props.marriageIntentionCertificateRequest.clearCertificateRequest();
  };

  private advanceQuestion = (
    modifiedRequest: MarriageIntentionCertificateRequest
  ) => {
    const { currentStep, marriageIntentionCertificateRequest } = this.props;

    const {
      localMarriageIntentionCertificateRequest,
      completedSteps,
    } = this.state;
    const { steps } = localMarriageIntentionCertificateRequest;

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

    this.gaEventActionAndLabel();

    const nextStep = newSteps[currentIndex + 1];
    this.setState({
      completedSteps: new Set([...completedSteps, steps.indexOf(nextStep)]),
    });

    Router.push(`/marriageintention?step=${nextStep}`);
  };

  private stepBackOneQuestion = (): void => {
    const {
      marriageIntentionCertificateRequest: { steps },
      currentStep,
    } = this.props;
    const currentIndex = steps.indexOf(currentStep);

    // Ensure we cannot go back any further than the first question.
    const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;

    Router.push(`/marriageintention?step=${steps[newIndex]}`);
  };

  private formErrors = (data: {
    action: string;
    ref?: React.RefObject<HTMLSpanElement> | null;
    section: string;
  }) => {
    const { action, ref, section } = data;
    if (action === 'add') {
      this.state.errorElemSrc[section] = ref;
    } else {
      delete this.state.errorElemSrc[section];
    }
  };

  private toggleDisclaimerModal = (val: boolean): void => {
    this.setState({ showDisclaimer: val });
  };

  private disclaimerModalConfirmed = (dest?: string) => {
    const {
      marriageIntentionCertificateRequest: { steps },
      currentStep,
    } = this.props;

    this.setState({
      backTrackingDisclaimer: true,
      showDisclaimer: false,
    });
    console.log(`dest?: `, dest);

    const posDest = [
      'partnerFormA',
      'partnerFormB',
      'contactInfo',
      'reviewForms',
    ];

    if (steps.indexOf(currentStep) > 0) {
      if (dest && typeof dest === 'string') {
        if (posDest.indexOf(dest) > -1) {
          Router.push(`/marriageintention?step=${dest}`);
        } else {
          Router.push(`/marriageintention?step=${steps[currentStep] - 1}`);
        }
      } else {
        Router.push(`/marriageintention?step=${steps[currentStep] - 1}`);
      }
    }
  };

  private progressNavClick = (i: number) => {
    const {
      marriageIntentionCertificateRequest: { steps },
      currentStep,
    } = this.props;
    const { showDisclaimer, backTrackingDisclaimer } = this.state;
    const direction = i < steps.indexOf(currentStep) ? '-' : '+';
    let partnerFlag = '';

    if (currentStep === 'partnerFormA') partnerFlag = 'A';
    if (currentStep === 'partnerFormB') partnerFlag = 'B';

    console.log(
      `backTrackingDisclaimer: ${backTrackingDisclaimer} |showDisclaimer: ${showDisclaimer}`
    );

    const isDisclaimerable =
      currentStep === 'contactInfo' ||
      currentStep === 'partnerFormA' ||
      currentStep === 'partnerFormB' ||
      currentStep === 'reviewForms'
        ? true
        : false;

    if (isDisclaimerable && backTrackingDisclaimer === false) {
      this.toggleDisclaimerModal(true);
    } else {
      if (partnerFlag.length > 0 && direction === '+') {
        const isCompleteRet = this.isComplete(
          partnerFlag,
          this.state.localMarriageIntentionCertificateRequest
        );

        if (
          isCompleteRet &&
          Object.entries(this.state.errorElemSrc).length === 0
        ) {
          Router.push(`/marriageintention?step=${steps[i]}`);
        } else {
          if (this.state.errorElemSrc['nameFields']) {
            this.scrollToElem(this.state.errorElemSrc['nameFields']);
          } else if (this.state.errorElemSrc['datePlaceOfBirth']) {
            this.scrollToElem(this.state.errorElemSrc['datePlaceOfBirth']);
          } else if (this.state.errorElemSrc['residence']) {
            this.scrollToElem(this.state.errorElemSrc['residence']);
          } else if (this.state.errorElemSrc['marriageBlock']) {
            this.scrollToElem(this.state.errorElemSrc['marriageBlock']);
          } else if (this.state.errorElemSrc['parents']) {
            this.scrollToElem(this.state.errorElemSrc['parents']);
          }
        }
      } else {
        Router.push(`/marriageintention?step=${steps[i]}`);
      }
    }
  };

  private scrollToElem = (ref: HTMLSpanElement) => {
    window.scrollTo({
      top: ref['current'].offsetTop,
      behavior: 'smooth',
    });
  };

  private isComplete(
    partnerFlag: string,
    { requestInformation }: MarriageIntentionCertificateRequest
  ): boolean {
    const advance = isPartnerFormPageComplete(partnerFlag, requestInformation);
    return advance;
  }

  render() {
    const { currentStep } = this.props;
    const {
      localMarriageIntentionCertificateRequest,
      completedSteps,
      backTrackingDisclaimer,
    } = this.state;
    const { steps, labels } = localMarriageIntentionCertificateRequest;

    let questionsEl: React.ReactNode = null;

    const $defaultUI = (
      <>
        <Instructions
          marriageIntentionCertificateRequest={
            localMarriageIntentionCertificateRequest
          }
          handleProceed={this.advanceQuestion.bind(
            this,
            localMarriageIntentionCertificateRequest
          )}
          handleUserReset={this.handleUserReset}
        />

        {emailContentBlock()}
      </>
    );

    switch (currentStep) {
      case 'instructions':
        questionsEl = $defaultUI;
        break;
      case 'contactInfo':
        questionsEl = (
          <>
            <ContactInfo
              marriageIntentionCertificateRequest={
                localMarriageIntentionCertificateRequest
              }
              handleProceed={this.advanceQuestion.bind(
                this,
                localMarriageIntentionCertificateRequest
              )}
              handleStepBack={this.stepBackOneQuestion}
              toggleDisclaimerModal={this.toggleDisclaimerModal}
              backTrackingDisclaimer={backTrackingDisclaimer}
            />

            {emailContentBlock()}
          </>
        );
        break;
      case 'partnerFormA':
        questionsEl = (
          <>
            <PartnerFormA
              marriageIntentionCertificateRequest={
                localMarriageIntentionCertificateRequest
              }
              handleProceed={this.advanceQuestion.bind(
                this,
                localMarriageIntentionCertificateRequest
              )}
              handleStepBack={this.stepBackOneQuestion}
              partnerLabel={'A'}
              partnerNum={1}
              formErrors={this.formErrors}
              refObjs={{
                nameFieldsRef: this.partnerA_nameFieldsRef,
                residenceRef: this.partnerA_residenceRef,
                marriageRef: this.partnerA_marriageRef,
                datePlaceOfBirthRef: this.partnerA_datePlaceOfBirthRef,
                parentsRef: this.partnerA_parentsRef,
              }}
              errorElemSrc={this.state.errorElemSrc}
              toggleDisclaimerModal={this.toggleDisclaimerModal}
              backTrackingDisclaimer={backTrackingDisclaimer}
            />

            {emailContentBlock()}
          </>
        );
        break;
      case 'partnerFormB':
        questionsEl = (
          <>
            <PartnerFormB
              marriageIntentionCertificateRequest={
                localMarriageIntentionCertificateRequest
              }
              handleProceed={this.advanceQuestion.bind(
                this,
                localMarriageIntentionCertificateRequest
              )}
              handleStepBack={this.stepBackOneQuestion}
              partnerLabel={'B'}
              partnerNum={2}
              formErrors={this.formErrors}
              refObjs={{
                nameFieldsRef: this.partnerB_nameFieldsRef,
                residenceRef: this.partnerB_residenceRef,
                marriageRef: this.partnerB_marriageRef,
                datePlaceOfBirthRef: this.partnerB_datePlaceOfBirthRef,
                parentsRef: this.partnerA_parentsRef,
              }}
              errorElemSrc={this.state.errorElemSrc}
              backTrackingDisclaimer={this.state.backTrackingDisclaimer}
              toggleDisclaimerModal={this.toggleDisclaimerModal}
            />

            {emailContentBlock()}
          </>
        );
        break;
      case 'reviewForms':
        questionsEl = (
          <>
            <ReviewForms
              marriageIntentionCertificateRequest={
                localMarriageIntentionCertificateRequest
              }
              handleProceed={this.submitRequest.bind(
                this,
                localMarriageIntentionCertificateRequest
              )}
              handleStepBack={this.stepBackOneQuestion}
              toggleDisclaimerModal={this.toggleDisclaimerModal}
              backTrackingDisclaimer={backTrackingDisclaimer}
            />

            {emailContentBlock()}
          </>
        );
        break;
      case 'reviewRequest':
        questionsEl = (
          <Receipt
            marriageIntentionCertificateRequest={
              localMarriageIntentionCertificateRequest
            }
          />
        );
        break;
      default:
        questionsEl = $defaultUI;
        break;
    }

    return (
      <PageWrapper
        certificateType="intention"
        progressNav={{
          steps: labels,
          totalSteps: steps.length,
          currentStep: steps.indexOf(currentStep),
          showStepName: false,
          offset: 0,
          completed: Array.from(completedSteps),
          clickHandler: this.progressNavClick,
          blockStepBackAfterLastNav: true,
        }}
        classString={'b-c'}
        mainHeadline={'Marriage Intention Application'}
      >
        <div className="b-c b-c--nbp" css={INTENTION}>
          <Head>
            <title>Boston.gov — Marriage Intention Application</title>
          </Head>

          {questionsEl}

          {this.state.showDisclaimer && (
            <StatusModal
              header={`Save & Continue`}
              hideTopBorderDecoration={true}
              closeModalHandler={this.toggleDisclaimerModal}
              confirmHandler={this.disclaimerModalConfirmed}
              confirmBtnText={`Confirm`}
            >
              <p className="t--s500">
                If you edit your information you must click the `Save and
                Continue` button save your changes
              </p>
            </StatusModal>
          )}
        </div>
      </PageWrapper>
    );
  }
}

const emailContentBlock = () => {
  return (
    <div className="m-v700">
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
  );
};
