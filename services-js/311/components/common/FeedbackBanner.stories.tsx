import React from 'react';
import { storiesOf } from '@storybook/react';
import FeedbackBanner from './FeedbackBanner';

storiesOf('FeedbackBanner', module)
  .addDecorator(next => <div className="b-c">{next()}</div>)
  .add('Fit page width', () => <FeedbackBanner fit="PAGE" />)
  .add('Fit dialog width', () => <FeedbackBanner fit="DIALOG" />);
