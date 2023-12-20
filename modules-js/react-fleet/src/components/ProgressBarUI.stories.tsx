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
    name: 'getting-started',
    uri: '?step=0',
    completed: true,
  },
  {
    label: 'Person 1',
    name: 'name',
    uri: '/uri',
    completed: true,
  },
  {
    label: 'Person 2',
    name: 'name',
    uri: '/uri',
    completed: false,
  },
  {
    label: 'Contact Info',
    name: 'name',
    uri: '/uri',
    completed: false,
  },
  {
    label: 'Review',
    name: 'name',
    uri: '/uri',
    completed: false,
  },
  {
    label: 'Submit',
    name: 'name',
    uri: '/uri',
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
      currentStep={1}
    />
  ));
