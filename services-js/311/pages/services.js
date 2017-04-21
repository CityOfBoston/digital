// @flow

import withGlamor from '../lib/mixins/with-glamor';
import withStore from '../lib/mixins/with-store';

// eslint-disable-next-line global-require
export default withStore(withGlamor(() => require('../components/services/ServicesLayout').default));
