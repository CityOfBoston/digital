import React from 'react';

import { AppLayout } from '@cityofboston/react-fleet';

const PageLayout = props => {
  return <AppLayout>{props.children}</AppLayout>;
};

export default PageLayout;
