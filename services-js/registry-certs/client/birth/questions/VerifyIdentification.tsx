import React, { MouseEvent } from 'react';
import { observer } from 'mobx-react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';

import QuestionComponent from '../components/QuestionComponent';
import VerifyIdentificationComponent from '../components/VerifyIdentificationComponent';
import UploadableFile from '../../models/UploadableFile';

interface Props {
  gaSendEvent: (label: string) => void;
  birthCertificateRequest: BirthCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
}

@observer
export default class VerifyIdentification extends React.Component<Props> {
  updateSupportingDocuments = (documents: UploadableFile[]): void => {
    this.props.birthCertificateRequest.answerQuestion({
      supportingDocuments: documents,
    });
  };

  updateIdImage = (side: string, file: File): void => {
    const { birthCertificateRequest } = this.props;

    const existingFile =
      side === 'front'
        ? birthCertificateRequest.requestInformation.idImageFront
        : birthCertificateRequest.requestInformation.idImageBack;

    if (existingFile) {
      existingFile.delete();
    }

    let uploadableFile: UploadableFile | null = null;

    if (file) {
      uploadableFile = new UploadableFile(
        file,
        birthCertificateRequest.uploadSessionId,
        side === 'front' ? 'id front' : 'id back'
      );

      uploadableFile.upload();
    }

    if (side === 'front') {
      birthCertificateRequest.answerQuestion({
        idImageFront: uploadableFile,
      });
    } else if (side === 'back') {
      birthCertificateRequest.answerQuestion({
        idImageBack: uploadableFile,
      });
    }
  };

  render() {
    const {
      supportingDocuments,
      idImageFront,
      idImageBack,
    } = this.props.birthCertificateRequest.requestInformation;

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
          uploadSessionId={this.props.birthCertificateRequest.uploadSessionId}
          gaSendEvent={this.props.gaSendEvent}
          supportingDocuments={supportingDocuments}
          updateSupportingDocuments={this.updateSupportingDocuments}
          updateIdImages={this.updateIdImage}
          idImageBack={idImageBack}
          idImageFront={idImageFront}
        />
      </QuestionComponent>
    );
  }
}
