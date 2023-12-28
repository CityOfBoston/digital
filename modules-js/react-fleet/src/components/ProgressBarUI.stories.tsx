import React from 'react';

import { storiesOf } from '@storybook/react';
import { withKnobs, button } from '@storybook/addon-knobs';

import { NarrowWrapper } from '@cityofboston/storybook-common';

import ProgressBarUI from './ProgressBarUI';
import { stepObj } from '../utilities/interfaces';

// interface Props {
//   currentStep: number;
// }

// interface State {
//   completed: boolean;
// }

const taskList: Array<stepObj> = [
  {
    label: 'Getting Started',
    completed: true,
  },
  {
    label: 'Person 1',
    completed: true,
  },
  {
    label: 'Person 2',
    completed: false,
  },
  {
    label: 'Contact Info',
    completed: false,
  },
  {
    label: 'Review',
    completed: false,
  },
  {
    label: 'Submit',
    completed: false,
  },
];

// class InteractiveStep extends React.Component<Props, State> {
//   constructor(props) {
//     super(props);

//     this.state = {
//       completed: false,
//     };
//   }

//   render() {
//     const label = 'Marriage Intention Application';
//     const handler = () => this.setState({ completed: true });

//     button(label, handler);

//     return (
//       <ProgressBarUI
//         steps={taskList}
//         totalSteps={taskList.length}
//         currentStep={this.props.currentStep}
//         currentStepCompleted={this.state.completed}
//       />
//     );
//   }
// }

storiesOf('ProgressBarUI', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .addDecorator(withKnobs)
  .add('default', () => (
    <ProgressBarUI
      steps={taskList}
      totalSteps={taskList.length}
      currentStep={0}
      offset={1}
      showStepName={true}
      // currentStepCompleted={this.state.completed}
    />
  ));
