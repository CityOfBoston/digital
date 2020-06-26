/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component, MouseEvent } from 'react';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import ClientInstructionsContent from '../../common/question-components/ClientInstructionsContent';

interface Props {
  handleStepBack: (ev: MouseEvent) => void;
}

export default class ClientInstructions extends Component<Props> {
  public render() {
    return (
      <QuestionComponent
        handleStepBack={this.props.handleStepBack}
        allowProceed={false}
      >
        <ClientInstructionsContent certificateType="birth" />
      </QuestionComponent>
    );
  }
}
