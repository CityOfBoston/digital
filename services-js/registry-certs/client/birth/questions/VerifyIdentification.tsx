import React from 'react';
import { observer } from 'mobx-react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';

import QuestionComponent from '../components/QuestionComponent';
import VerifyIdentificationComponent from '../components/VerifyIdentificationComponent';
import UploadableFile from '../../models/UploadableFile';

interface Props {
  birthCertificateRequest: BirthCertificateRequest;
  handleProceed: () => void;
  handleStepBack: () => void;
}

interface State {
  canProceed: boolean;
}

// todo: remove placeholderUploadSessionId s

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

  updateSupportingDocuments = (documents: UploadableFile[]): void => {
    this.props.birthCertificateRequest.answerQuestion({
      supportingDocuments: documents,
    });
  };

  updateIdImage = (side: string, file: File): void => {
    const uploadableFile = new UploadableFile(
      file,
      'placeholderUploadSessionId'
    );

    if (side === 'front') {
      this.props.birthCertificateRequest.answerQuestion({
        idImageFront: uploadableFile,
      });
    } else if (side === 'back') {
      this.props.birthCertificateRequest.answerQuestion({
        idImageBack: uploadableFile,
      });
    }
  };

  render() {
    const {
      supportingDocuments,
    } = this.props.birthCertificateRequest.requestInformation;

    return (
      <QuestionComponent
        allowProceed={this.state.canProceed}
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        nextButtonText="Review request"
      >
        <VerifyIdentificationComponent
          requestInformation={
            this.props.birthCertificateRequest.requestInformation
          }
          sectionsToDisplay="all"
          uploadSessionId="placeholderUploadSessionId"
          supportingDocuments={supportingDocuments}
          updateSupportingDocuments={this.updateSupportingDocuments}
          updateIdImages={this.updateIdImage}
          isComplete={this.isComplete}
        />
      </QuestionComponent>
    );
  }
}
