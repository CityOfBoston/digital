import React from 'react';
import { storiesOf } from '@storybook/react';

import VerifyIdentificationComponent from './VerifyIdentificationComponent';

storiesOf('Birth/VerifyIdentificationComponent', module).add('default', () => (
  <VerifyIdentificationComponent
    updateSupportingDocuments={() => {}}
    updateIdImages={() => {}}
  />
));
