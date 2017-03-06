// @flow

import withStore from '../lib/mixins/with-store';
import withGlamor from '../lib/mixins/with-glamor';
import getStore from '../data/store';

// eslint-disable-next-line global-require
export default withStore(getStore)(withGlamor(() => require('../components/report/ReportLayout').default));
