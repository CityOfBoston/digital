import React from 'react';
import { Footer } from '@cityofboston/react-fleet';

/**
 * Wraps react-fleet’s Footer to ensure we’re z-positioned in a good place to go
 * over the map and such.
 */
export default function WrappedFooter() {
  return <Footer style={{ position: 'relative', zIndex: 2 }} />;
}
