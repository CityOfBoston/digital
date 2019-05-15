import React from 'react';

import { storiesOf } from '@storybook/react';

import { YesNoUnknownAnswer } from '../../types';

import YesNoUnsureComponent from './YesNoUnsureComponent';

interface Props {}

interface State {
  answer: YesNoUnknownAnswer;
}

class YesNoUnsureComponentStories extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      answer: '',
    };
  }

  handleChange = event => {
    this.setState({ answer: event.target.value });
  };

  render() {
    return (
      <YesNoUnsureComponent
        questionName="bornInBoston"
        questionValue={this.state.answer}
        handleChange={this.handleChange}
      />
    );
  }
}

storiesOf(
  'Common Components/Question Components/YesNoUnsureComponent',
  module
).add('default', () => <YesNoUnsureComponentStories />);
