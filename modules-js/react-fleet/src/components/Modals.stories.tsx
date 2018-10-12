import React from 'react';
import { storiesOf } from '@storybook/react';

import StatusModal from './StatusModal';

storiesOf('Components/Modals', module).add('Status', () => (
  <StatusModal message="Saving your new password…">
    <div className="t--info m-t300">
      Please be patient and don’t refresh your browser. This might take a bit.
    </div>
  </StatusModal>
));
