import React, { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string | Object;
  style?: object;
  className?: string;
}

export default function Checkbox({
  className,
  style,
  error,
  children,
  ...inputAttributes
}: Props): JSX.Element {
  return (
    <label className={`cb ${className || ''}`} style={style}>
      <input
        type="checkbox"
        className={`cb-f ${error ? 'cb-f--err' : ''}`}
        {...inputAttributes}
      />

      <span className="cb-l">{children}</span>
    </label>
  );
}
