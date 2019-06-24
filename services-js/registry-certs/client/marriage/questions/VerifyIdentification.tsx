import React, { MouseEvent } from 'react';
import { observer } from 'mobx-react';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import VerifyIdentificationComponent from '../../common/question-components/VerifyIdentificationComponent';
import UploadableFile from '../../models/UploadableFile';

interface Props {
  marriageCertificateRequest: MarriageCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
}

@observer
export default class VerifyIdentification extends React.Component<Props> {
  updateSupportingDocuments = (documents: UploadableFile[]): void => {
    this.props.marriageCertificateRequest.answerQuestion({
      supportingDocuments: documents,
    });
  };

  updateIdImage = (side: string, file: File): void => {
    const { marriageCertificateRequest } = this.props;

    const existingFile =
      side === 'front'
        ? marriageCertificateRequest.requestInformation.idImageFront
        : marriageCertificateRequest.requestInformation.idImageBack;

    if (existingFile) {
      existingFile.delete('marriage');
    }

    let uploadableFile: UploadableFile | null = null;

    if (file) {
      uploadableFile = new UploadableFile(
        file,
        marriageCertificateRequest.uploadSessionId,
        side === 'front' ? 'id front' : 'id back'
      );

      uploadableFile.upload('marriage');
    }

    if (side === 'front') {
      marriageCertificateRequest.answerQuestion({
        idImageFront: uploadableFile,
      });
    } else if (side === 'back') {
      marriageCertificateRequest.answerQuestion({
        idImageBack: uploadableFile,
      });
    }
  };

  render() {
    const {
      supportingDocuments,
      idImageFront,
      idImageBack,
    } = this.props.marriageCertificateRequest.requestInformation;

    const canProceed = !!idImageFront && idImageFront.status === 'success';

    return (
      <QuestionComponent
        allowProceed={canProceed}
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        nextButtonText="Review request"
      >
        <VerifyIdentificationComponent
          sectionsToDisplay="all"
          uploadSessionId={
            this.props.marriageCertificateRequest.uploadSessionId
          }
          supportingDocuments={supportingDocuments}
          updateSupportingDocuments={this.updateSupportingDocuments}
          updateIdImages={this.updateIdImage}
          idImageBack={idImageBack}
          idImageFront={idImageFront}
          certificateType="marriage"
        />
      </QuestionComponent>
    );
  }
}
