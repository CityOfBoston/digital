// @flow

import * as React from 'react';

type Props = {|
  subtitle?: string | React.Element<*>,
  children: React.Node,
|};

export default function SectionHeader({ subtitle, children }: Props) {
  return (
    <div className="sh sh--y">
      <h1 className="sh-title">
        {children}
      </h1>
      {subtitle &&
        <div className="sh-contact">
          {subtitle}
        </div>}
    </div>
  );
}
