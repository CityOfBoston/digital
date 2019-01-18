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
          steps={taskList}
          currentStep={taskList[this.props.currentStep]}
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
    <ProgressBar steps={taskList} currentStep={taskList[3]} />
  ))
  .add('with task name', () => (
    <ProgressBar steps={taskList} currentStep={taskList[2]} showStepName />
  ))
  .add('first step', () => <InteractiveStep currentStep={0} />)
  .add('last step', () => <InteractiveStep currentStep={4} />);
