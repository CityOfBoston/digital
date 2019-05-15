/** @jsx jsx */

import { jsx } from '@emotion/core';

import { storiesOf } from '@storybook/react';

import { NarrowWrapper } from '@cityofboston/storybook-common';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

import { SECTION_HEADING_STYLING } from './styling';

function placeholderQuestion(): JSX.Element {
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
        questionValue=""
        handleChange={() => {}}
      />
    </FieldsetComponent>
  );
}

storiesOf('Common Components/Question Components/QuestionComponent', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .add('default', () => (
    <QuestionComponent handleProceed={() => {}} allowProceed={true}>
      {placeholderQuestion()}
    </QuestionComponent>
  ))
  .add('with back button', () => (
    <QuestionComponent
      handleProceed={() => {}}
      allowProceed={true}
      handleStepBack={() => {}}
    >
      {placeholderQuestion()}
    </QuestionComponent>
  ))
  .add('with reset button', () => (
    <QuestionComponent
      handleStepBack={() => {}}
      handleReset={() => {}}
      startOver={true}
    >
      {placeholderQuestion()}
    </QuestionComponent>
  ));
