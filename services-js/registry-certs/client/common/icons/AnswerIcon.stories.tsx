import React from 'react';

import { storiesOf } from '@storybook/react';

import { CenterWrapper } from '@cityofboston/storybook-common';

import AnswerIcon from './AnswerIcon';

storiesOf('Common Components/Question Components/AnswerIcon', module)
  .addDecorator(storyFn => (
    <div style={{ color: '#000', display: 'flex', justifyContent: 'center' }}>
      <CenterWrapper>{storyFn()}</CenterWrapper>
    </div>
  ))

  .add('question mark', () => <AnswerIcon iconName="questionMark" />)
  .add('check mark', () => <AnswerIcon iconName="checkMark" />)
  .add('x symbol', () => <AnswerIcon iconName="xSymbol" />)
  .add('exclamation point', () => <AnswerIcon iconName="excl" />);
