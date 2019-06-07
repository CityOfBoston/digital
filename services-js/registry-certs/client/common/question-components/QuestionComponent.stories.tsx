/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component } from 'react';

import { storiesOf } from '@storybook/react';

import { YesNoUnknownAnswer } from '../../types';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

import { SECTION_HEADING_STYLING } from './styling';

interface Props {}
interface State {
  answer: YesNoUnknownAnswer;
}

class PlaceholderQuestion extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      answer: '',
    };
  }

  handleClick = event => this.setState({ answer: event.target.value });

  render() {
    return (
      <FieldsetComponent
        legendText={
          <h2 id="questionText" css={SECTION_HEADING_STYLING}>
            Question text?
          </h2>
        }
      >
        <YesNoUnsureComponent
          questionName="bornInBoston"
          questionValue={this.state.answer}
          handleChange={this.handleClick}
        />
      </FieldsetComponent>
    );
  }
}

storiesOf('Common Components/Question Components/QuestionComponent', module)
  .add('default', () => (
    <QuestionComponent handleProceed={() => {}} allowProceed={true}>
      <PlaceholderQuestion />
    </QuestionComponent>
  ))
  .add('with back button', () => (
    <QuestionComponent
      handleProceed={() => {}}
      allowProceed={true}
      handleStepBack={() => {}}
    >
      <PlaceholderQuestion />
    </QuestionComponent>
  ))
  .add('with reset button', () => (
    <QuestionComponent
      handleStepBack={() => {}}
      handleReset={() => {}}
      startOver={true}
    >
      <PlaceholderQuestion />
    </QuestionComponent>
  ));
