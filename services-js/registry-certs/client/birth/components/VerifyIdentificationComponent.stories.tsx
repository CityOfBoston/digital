import React from 'react';
import { storiesOf } from '@storybook/react';

import VerifyIdentificationComponent from './VerifyIdentificationComponent';

storiesOf('Birth/VerifyIdentificationComponent', module)
  .add('default', () => (
    <VerifyIdentificationComponent
      sectionsToDisplay="all"
      updateSupportingDocuments={() => {}}
      updateIdImages={() => {}}
    />
  ))
  .add('supporting documents only', () => (
    <VerifyIdentificationComponent
      sectionsToDisplay="supportingDocumentsOnly"
      updateSupportingDocuments={() => {}}
      updateIdImages={() => {}}
    />
  ));
