import React from 'react';
import { storiesOf } from '@storybook/react';

import RadioItemComponent from './RadioItemComponent';

const iconStyle = {
  width: 170,
  stroke: 'currentColor',
  strokeWidth: '0.5',
  fill: 'none',
};

const itemStyle = { margin: '1rem' };

function icon() {
  return (
    <svg viewBox="0 0 15 15" style={iconStyle}>
      <circle cx="5" cy="5" r="4.5" />
      <circle cx="10" cy="5" r="4.5" />
      <circle cx="5" cy="10" r="4.5" />
      <circle cx="10" cy="10" r="4.5" />
    </svg>
  );
}

interface Props {}

interface State {
  answer: string;
}

class SampleQuestion extends React.Component<Props, State> {
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
      <ul
        role="radiogroup"
        style={{
          listStyle: 'none',
          margin: 0,
          color: '#000',
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        <li style={itemStyle}>
          <RadioItemComponent
            questionName="answer"
            questionValue={this.state.answer}
            itemValue="answer1"
            labelText="Answer 1"
            handleChange={this.handleChange}
          >
            {icon()}
          </RadioItemComponent>
        </li>

        <li style={itemStyle}>
          <RadioItemComponent
            questionName="answer"
            questionValue={this.state.answer}
            itemValue="answer2"
            labelText="Answer 2"
            handleChange={this.handleChange}
          >
            {icon()}
          </RadioItemComponent>
        </li>
        <li style={itemStyle}>
          <RadioItemComponent
            questionName="answer"
            questionValue={this.state.answer}
            itemValue="answer3"
            labelText="Answer 3"
            handleChange={this.handleChange}
          >
            {icon()}
          </RadioItemComponent>
        </li>
      </ul>
    );
  }
}

storiesOf('Common Components/Question Components/RadioItemComponent', module)
  .add('single item', () => (
    <div style={{ color: '#000' }}>
      <RadioItemComponent
        questionName="question"
        questionValue="question"
        itemValue="question"
        labelText="Question"
        handleChange={() => {}}
      >
        {icon()}
      </RadioItemComponent>
    </div>
  ))
  .add('multiple answers', () => <SampleQuestion />);
