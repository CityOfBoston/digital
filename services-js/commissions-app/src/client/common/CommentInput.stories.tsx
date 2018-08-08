import React from 'react';
import { storiesOf } from '@storybook/react';
import CommentInput from '../../client/common/CommentInput';

storiesOf('CommentInput', module).add('default', () => (
  <CommentInput
    name="comments"
    placeholder="Other Comments"
    value="comments"
    onChange=""
    onBlur=""
  />
));
