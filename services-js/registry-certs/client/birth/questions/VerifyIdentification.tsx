import React from 'react';
import { observer } from 'mobx-react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';

import QuestionComponent from '../components/QuestionComponent';
import VerifyIdentificationComponent from '../components/VerifyIdentificationComponent';

interface Props {
  birthCertificateRequest: BirthCertificateRequest;
  handleProceed: () => void;
  handleStepBack: () => void;
}

interface State {
  canProceed: boolean;
}

@observer
export default class VerifyIdentification extends React.Component<
  Props,
  State
> {
  state: State = {
    canProceed: false,
  };

  isComplete = (canProceed: boolean): void => {
    this.setState({ canProceed });
  };

  updateSupportingDocuments = (documents: File[]): void => {
    this.props.birthCertificateRequest.answerQuestion({
      supportingDocuments: documents,
    });
  };

  updateIdImage = (side: string, file: any): void => {
    if (side === 'front') {
      this.props.birthCertificateRequest.answerQuestion({
        idImageFront: file,
      });
    } else if (side === 'back') {
      this.props.birthCertificateRequest.answerQuestion({
        idImageBack: file,
      });
    }
  };

  render() {
    return (
      <QuestionComponent
        allowProceed={this.state.canProceed}
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        nextButtonText="Review request"
      >
        <VerifyIdentificationComponent
          supportingDocuments={this.updateSupportingDocuments}
          idImages={this.updateIdImage}
          isComplete={this.isComplete}
        />
      </QuestionComponent>
    );
  }
}
