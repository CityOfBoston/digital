import withEmotion from '../lib/mixins/with-emotion';
import withStore from '../lib/mixins/with-store';

export default withStore(
  withEmotion(() => require('../components/services/ServicesLayout').default)
);
