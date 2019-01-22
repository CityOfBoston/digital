import React from 'react';

import { storiesOf } from '@storybook/react';

import ProgressBar from './ProgressBar';

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
    return (
      <>
        <ProgressBar
          totalSteps={taskList.length}
          currentStep={this.props.currentStep}
          currentStepCompleted={this.state.completed}
        />

        {/* styled to (hopefully) make clear that this is not part of the actual component */}
        <button
          type="button"
          style={{
            fontFamily: 'monospace',
            display: 'block',
            margin: '1rem auto',
          }}
          onClick={() => this.setState({ completed: true })}
        >
          Storybook demonstration: complete the task
        </button>
      </>
    );
  }
}

storiesOf('Components/Progress Bar', module)
  .add('default', () => (
    <ProgressBar totalSteps={taskList.length} currentStep={4} />
  ))
  .add('with task name', () => (
    <ProgressBar
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
