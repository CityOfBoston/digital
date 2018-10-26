import React, { ReactNode } from 'react';

interface Props {
  name: string;
  title: string | ReactNode;
  onChange: any;
  onBlur?: any;
  required?: boolean;
  error?: boolean | string | Object;
  value?: string;
  checked?: boolean;
  style?: object;
  className?: string;
}

export default function Checkbox(props: Props): JSX.Element {
  return (
    <label className={`cb ${props.className || ''}`} style={props.style}>
      <input
        name={props.name}
        value={props.value}
        required={props.required}
        type="checkbox"
        className={`cb-f ${props.error ? 'cb-f--err' : ''}`}
        onChange={props.onChange}
        onBlur={props.onBlur}
        checked={props.checked}
        style={{ border: 'none' }}
      />

      {typeof props.title === 'string' ? (
        <span className="cb-l">{props.title}</span>
      ) : (
        <>{props.title}</>
      )}
    </label>
  );
}
