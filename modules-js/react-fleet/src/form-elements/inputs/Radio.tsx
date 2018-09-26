import React from 'react';


interface RadioProps {
  name: string;
  labelText: string;

  required?: boolean;
  error?: string;
  value?: string;
  checked?: boolean;
  style?: object;
  className?: string;

  onChange?(e: any): void;
  onBlur?(e: any): void;
}

export default function Radio(props: RadioProps): JSX.Element {
  return (
    <label
      className={`ra ${props.className || ''}`}
      style={props.style}
    >
      <input
        name={props.name}
        value={props.value}
        type="radio"
        className="ra-f"
        onChange={props.onChange}
        onBlur={props.onBlur}
        checked={props.checked}
      />

      <span className="ra-l">{props.labelText}</span>
    </label>
  );
}


interface RadioItem {
  labelText: string;
  value?: string;
  checked?: boolean;
}

interface RadioGroupProps {
  items: RadioItem[];
  name: string;
  groupLabel?: string;
  className?: string;
  handleChange?(e: any): void;
}

/**
 * Render a collection of radio buttons by providing an array of radio item information objects.
 */
export function RadioGroup(props: RadioGroupProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label={props.groupLabel || props.name}
      className={props.className}
    >
      {props.items.map((item, index) => (
        <Radio
          key={`radio-${index}`}
          name={props.name}
          labelText={item.labelText}
          value={item.value}
          checked={item.checked}
          onChange={props.handleChange}
          className="p-b200"
        />
      ))}
    </div>
  );
}
