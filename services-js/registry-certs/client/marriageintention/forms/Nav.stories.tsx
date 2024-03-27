import React from 'react';

import { storiesOf } from '@storybook/react';
import { withKnobs, button } from '@storybook/addon-knobs';

import { NarrowWrapper } from '@cityofboston/storybook-common';

import { ProgressNav } from '@cityofboston/react-fleet';

// import { ProgressNavProps } from '../../../lib/interfaces';

// interface Props {
//   progressNav: ProgressNavProps;
// }

interface Props {
  steps: Array<string>;
  totalSteps: number;
  currentStep: number;
  showStepName?: boolean;
  offset?: number;
  completed?: Array<number>;
  clickHandler?: any;
  blockStepBackAfterLastNav?: boolean;
}

interface State {
  completed: boolean;
}

const taskList: Array<string> = [
  'Getting Started',
  'Person 1',
  'Person 2',
  'Contact Info',
  'Review',
  'Submit',
];
const clickHandler = (key: number = 0): void => {
  console.log(`Step Click: #${key}`);
};

class InteractiveStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      completed: false,
    };
  }

  render() {
    const label = 'Marriage Intention Application';
    const handler = () => this.setState({ completed: true });

    button(label, handler);

    return <ProgressNav {...this.props} />;
  }
}

storiesOf('Marriage Intention/ProgressNav', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .addDecorator(withKnobs)
  .add('Step 1: Getting Started (default)', () => (
    <ProgressNav
      steps={taskList}
      totalSteps={taskList.length}
      currentStep={0}
      showStepName={true}
      offset={0}
      completed={[0]}
      clickHandler={clickHandler}
      blockStepBackAfterLastNav={true}
    />
  ))
  .add('Step 2: Person 1', () => (
    <InteractiveStep
      steps={taskList}
      currentStep={1}
      totalSteps={taskList.length}
      showStepName={true}
      offset={0}
      completed={[0, 1]}
      clickHandler={clickHandler}
      blockStepBackAfterLastNav={true}
    />
  ))
  .add('Step 3: Person 2', () => (
    <InteractiveStep
      steps={taskList}
      currentStep={2}
      totalSteps={taskList.length}
      showStepName={true}
      offset={0}
      completed={[0, 1, 2]}
      clickHandler={clickHandler}
      blockStepBackAfterLastNav={true}
    />
  ))
  .add('Step 4: Contact Info', () => (
    <InteractiveStep
      steps={taskList}
      currentStep={3}
      totalSteps={taskList.length}
      showStepName={true}
      offset={0}
      completed={[0, 1, 2, 3]}
      clickHandler={clickHandler}
      blockStepBackAfterLastNav={true}
    />
  ))
  .add('Step 4: Contact Info - Nav one step back', () => (
    <InteractiveStep
      steps={taskList}
      currentStep={2}
      totalSteps={taskList.length}
      showStepName={true}
      offset={0}
      completed={[0, 1, 2, 3]}
      clickHandler={clickHandler}
      blockStepBackAfterLastNav={true}
    />
  ))
  .add('Step 5: Review', () => (
    <InteractiveStep
      steps={taskList}
      currentStep={4}
      totalSteps={taskList.length}
      showStepName={true}
      offset={0}
      completed={[0, 1, 2, 3, 4]}
      clickHandler={clickHandler}
    />
  ))
  .add('Step 6: Submit', () => (
    <InteractiveStep
      steps={taskList}
      currentStep={5}
      totalSteps={taskList.length}
      showStepName={true}
      offset={0}
      completed={[0, 1, 2, 3, 4, 5]}
      clickHandler={clickHandler}
      blockStepBackAfterLastNav={true}
    />
  ));
