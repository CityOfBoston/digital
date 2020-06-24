/** @jsx jsx */

// import { jsx } from '@emotion/core';

import { Component, MouseEvent /*, ChangeEvent, ReactChild */ } from 'react';

import { observer } from 'mobx-react';

// import RadioItemComponent from '../../common/question-components/RadioItemComponent';
// import QuestionComponent from '../../common/question-components/QuestionComponent';
// import FieldsetComponent from '../../common/question-components/FieldsetComponent';
// import RelatedIcon from '../../common/icons/RelatedIcon';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';
// import { DisclaimerOpts } from '../../types';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
}

@observer
export default class Disclaimer extends Component<Props> {
  public static isComplete(
    marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest
  ): boolean {
    const {
      disclaimer,
    } = marriageIntentionCertificateRequest.requestInformation;

    return !!disclaimer;
  }

  // private handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
  //   const { marriageIntentionCertificateRequest } = this.props;
  //   marriageIntentionCertificateRequest.answerQuestion({
  //     [ev.currentTarget.name]: ev.currentTarget.value,
  //   });
  // };

  // private handleBooleanChange = (ev: ChangeEvent<HTMLInputElement>) => {
  //   const { marriageIntentionCertificateRequest } = this.props;
  //   marriageIntentionCertificateRequest.answerQuestion({
  //     [ev.currentTarget.name]: ev.currentTarget.value === 'true',
  //   });
  // };

  // private disclaimerQuestion(
  //   answerValue: DisclaimerOpts,
  //   questionDisplayText: string
  // ): ReactChild {
  //   const {
  //     requestInformation: { disclaimer },
  //   } = this.props.marriageIntentionCertificateRequest;

  //   return (
  //     <RadioItemComponent
  //       questionName="disclaimer"
  //       questionValue={disclaimer}
  //       itemValue={answerValue}
  //       labelText={questionDisplayText}
  //       handleChange={this.handleChange}
  //     >
  //       <RelatedIcon name={answerValue} />
  //     </RadioItemComponent>
  //   );
  // }

  public render() {
    // const { marriageIntentionCertificateRequest, handleProceed } = this.props;
    // const { disclaimer } = marriageIntentionCertificateRequest.requestInformation;

    return <div>Test</div>;
  }
}
