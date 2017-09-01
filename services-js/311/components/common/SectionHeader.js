// @flow

import React, {
  type Element as ReactElement,
  type Node as ReactNode,
} from 'react';

type Props = {|
  subtitle?: string | ReactElement<*>,
  children: ReactNode,
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
