import React from 'react';


interface Props {
  name: string;
  title: string;
  onChange: any;
  onBlur?: any;
  required?: boolean;
  error?: string;
  value?: string;
  checked?: boolean;
  style?: object;
  className?: string;
}

export default function Checkbox(props: Props): JSX.Element {
  return (
    <label
      className={`cb ${props.className || ''}`}
      style={props.style}
    >
      <input
        name={props.name}
        value={props.value}
        required={props.required}
        type="checkbox"
        className="cb-f"
        onChange={props.onChange}
        onBlur={props.onBlur}
        checked={props.checked}
      />

      <span className="cb-l">{props.title}</span>
    </label>
  );
}
