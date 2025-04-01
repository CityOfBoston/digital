import React from 'react';

import { storiesOf } from '@storybook/react';
import { NarrowWrapper } from '@cityofboston/storybook-common';
import { withKnobs } from '@storybook/addon-knobs';

import ExternalLink from './ExternalLink';

storiesOf('Form Elements | Checkout / ExternalLink', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .addDecorator(withKnobs)
  .add('variants', () => (
    <>
      <h4>Default (No Icon)</h4>
      <ExternalLink copy={'External Link'} href={'#'} displayIcon={false} />
      <br />

      <h4>Default (Icon)</h4>
      <ExternalLink copy={'External Link'} href={'#'} displayIcon={true} />
      <br />

      <h4>Default (Hovered)</h4>
      <ExternalLink
        copy={'External Link'}
        href={'#'}
        displayIcon={true}
        state={'hover'}
      />
      <br />

      <h4>Default (Focused)</h4>
      <ExternalLink
        copy={'External Link'}
        href={'#'}
        displayIcon={true}
        state={'focus'}
      />
      <br />

      <h4>Default (Visited)</h4>
      <ExternalLink
        copy={'External Link'}
        href={'#'}
        displayIcon={true}
        state={'visited'}
      />
      <br />
    </>
  ));
