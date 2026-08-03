import React from 'react';
import { storiesOf } from '@storybook/react';

import InteractiveDeathFlow, {
  MANY_RESULT_COUNT,
} from '../certificate/InteractiveDeathFlow';

storiesOf('Death/SearchPage', module)
  .add('no search', () => (
    <InteractiveDeathFlow
      initialQuery=""
      initialResultCount={null}
      defaultSearchResultCount={MANY_RESULT_COUNT}
    />
  ))
  .add('no results', () => (
    <InteractiveDeathFlow
      initialQuery="zzz"
      initialResultCount={0}
      defaultSearchResultCount={MANY_RESULT_COUNT}
    />
  ))
  .add('with results — fewer than one page', () => (
    <InteractiveDeathFlow
      initialQuery="Jayn Doe"
      initialResultCount={3}
      defaultSearchResultCount={3}
    />
  ))
  .add('with results — page 1 of many', () => (
    <InteractiveDeathFlow
      initialQuery="Jayn Doe"
      initialResultCount={MANY_RESULT_COUNT}
      defaultSearchResultCount={MANY_RESULT_COUNT}
    />
  ));
