// @flow

import React, {
  type Element as ReactElement,
  type Node as ReactNode,
} from 'react';

type Props = {|
  subtitle?: string | ReactElement<*>,
  children: ReactNode,
  className?: string,
|};

export default function SectionHeader({
  subtitle,
  children,
  className,
}: Props) {
  return (
    <div className={` sh sh--y ${className || ''}`}>
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
