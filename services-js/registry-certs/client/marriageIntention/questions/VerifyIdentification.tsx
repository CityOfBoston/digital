import React, { MouseEvent } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import VerifyIdentificationComponent from '../../common/question-components/VerifyIdentificationComponent';
import UploadableFile from '../../models/UploadableFile';

interface Props {
  siteAnalytics;
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
}

@observer
export default class VerifyIdentification extends React.Component<Props> {
  updateSupportingDocuments = (documents: UploadableFile[]): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion({
      supportingDocuments: documents,
    });
  };

  updateIdImage = (side: string, file: File): void => {
    const { marriageIntentionCertificateRequest } = this.props;

    const existingFile =
      side === 'front'
        ? marriageIntentionCertificateRequest.requestInformation.idImageFront
        : marriageIntentionCertificateRequest.requestInformation.idImageBack;

    if (existingFile) {
      existingFile.delete('birth');
    }

    let uploadableFile: UploadableFile | null = null;

    if (file) {
      uploadableFile = new UploadableFile(
        file,
        marriageIntentionCertificateRequest.uploadSessionId,
        side === 'front' ? 'id front' : 'id back'
      );

      uploadableFile.upload('birth');
    }

    if (side === 'front') {
      marriageIntentionCertificateRequest.answerQuestion({
        idImageFront: uploadableFile,
      });
    } else if (side === 'back') {
      marriageIntentionCertificateRequest.answerQuestion({
        idImageBack: uploadableFile,
      });
    }
  };

  render() {
    const {
      supportingDocuments,
      idImageFront,
      idImageBack,
    } = this.props.marriageIntentionCertificateRequest.requestInformation;

    const canProceed = !!idImageFront && idImageFront.status === 'success';

    return (
      <QuestionComponent
        allowProceed={canProceed}
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        nextButtonText="Review request"
      >
        <VerifyIdentificationComponent
          siteAnalytics={this.props.siteAnalytics}
          sectionsToDisplay="all"
          uploadSessionId={
            this.props.marriageIntentionCertificateRequest.uploadSessionId
          }
          supportingDocuments={supportingDocuments}
          updateSupportingDocuments={this.updateSupportingDocuments}
          updateIdImages={this.updateIdImage}
          idImageBack={idImageBack}
          idImageFront={idImageFront}
          certificateType="birth"
        />
      </QuestionComponent>
    );
  }
}
