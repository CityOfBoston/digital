import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import StatusModal from './StatusModal';

storiesOf('Notifications|Modals/StatusModal', module)
  .add('default', () => (
    <StatusModal message="Please wait a second…">
      <p className="t--s400">
        We’re submitting the form. Hang tight and don’t reload the page.
      </p>
    </StatusModal>
  ))
  .add('error with close', () => (
    <StatusModal
      message="Something went wrong!"
      error
      onClose={action('close')}
    >
      <p className="t--s400">
        Feel free to try again. If this keeps happening, let someone know.
      </p>
    </StatusModal>
  ))
  .add('hide top border decoration', () => (
    <StatusModal
      message="Something went wrong!"
      error
      // onClose={action('close')}
      hideTopBorderDecoration={true}
      absoluteCloseBtn={action('close')}
    >
      <p className="t--s400">
        If you edit your information, you must click the `Save and Continue`
        button to save your changes.
      </p>
    </StatusModal>
  ));
