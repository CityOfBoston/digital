import React from 'react';


export interface Props {
  name: string;
  value: string;
  onChange: any;
  required?: boolean;
  error?: string;
  onBlur: any;
  title: string;
  checked: boolean;
}

export default function Checkbox(props: Props): JSX.Element {
  return (
    <label className="cb">
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
