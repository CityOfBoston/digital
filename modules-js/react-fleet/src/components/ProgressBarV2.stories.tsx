import React from 'react';

import { storiesOf } from '@storybook/react';
import { withKnobs, button } from '@storybook/addon-knobs';

import { NarrowWrapper } from '@cityofboston/storybook-common';

import ProgressBarV2 from './ProgressBarV2';

const taskList = [
  'Personal information',
  'Review order',
  'Shipping information',
  'Payment information',
  'Place order',
];

interface Props {
  currentStep: number;
}

interface State {
  completed: boolean;
}

class InteractiveStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      completed: false,
    };
  }

  render() {
    const label = 'Complete current task';
    const handler = () => this.setState({ completed: true });

    button(label, handler);

    return (
      <ProgressBarV2
        totalSteps={taskList.length}
        currentStep={this.props.currentStep}
        currentStepCompleted={this.state.completed}
      />
    );
  }
}

storiesOf('ProgressBarV2', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .addDecorator(withKnobs)
  .add('default', () => (
    <ProgressBarV2 totalSteps={taskList.length} currentStep={4} />
  ))
  .add('with task name', () => (
    <ProgressBarV2
      totalSteps={taskList.length}
      currentStep={3}
      showStepName={taskList[2]}
    />
  ))
  .add('first step (interactive demo)', () => (
    <InteractiveStep currentStep={1} />
  ))
  .add('last step (interactive demo)', () => (
    <InteractiveStep currentStep={5} />
  ));
