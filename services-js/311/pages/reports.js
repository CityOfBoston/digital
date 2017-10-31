// @flow

import withEmotion from '../lib/mixins/with-emotion';
import withStore from '../lib/mixins/with-store';

// eslint-disable-next-line global-require
export default withStore(
  withEmotion(() => require('../components/case/CaseLayout').default)
);
