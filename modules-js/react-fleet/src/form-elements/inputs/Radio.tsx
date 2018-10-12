import React, { ChangeEvent, FocusEvent, ReactNode } from 'react';

interface RadioProps {
  name: string;
  label: string | ReactNode;

  required?: boolean;
  error?: string;
  value?: string;
  checked?: boolean;
  style?: object;
  className?: string;

  onChange?(e: ChangeEvent<HTMLInputElement>): void;
  onBlur?(e: FocusEvent<HTMLInputElement>): void;
}

/**
 * Renders a single radio button. If label is passed in as markup instead of a
 * string, that will replace the standard <span>.
 */
export default function Radio(props: RadioProps): JSX.Element {
  return (
    <label className={`ra ${props.className || ''}`} style={props.style}>
      <input
        name={props.name}
        value={props.value}
        type="radio"
        className="ra-f"
        checked={props.checked}
        onChange={props.onChange}
        onBlur={props.onBlur}
      />

      {typeof props.label === 'string' ? (
        <span className="ra-l">{props.label}</span>
      ) : (
        props.label
      )}
    </label>
  );
}

interface RadioItem {
  label: string | ReactNode;
  value?: string;
  className?: string;
  checked?: boolean;
}

interface RadioGroupProps {
  items: RadioItem[];
  name: string;
  groupLabel: string;
  hideLabel?: boolean;
  checkedValue?: string;
  className?: string;
  itemsClassName?: string;
  style?: object;
  itemsStyle?: object;

  handleItemChange?(e: ChangeEvent<HTMLInputElement>): void;
  handleItemBlur?(e: FocusEvent<HTMLInputElement>): void;
}

/**
 * Render a collection of radio buttons by providing an array of radio item
 * information objects.
 *
 * Group label must be included; if it should be visually hidden, its text is
 * added as an aria-label.
 *
 * If checked value is coming from a parent, pass it in as "checkedValue" prop.
 */
export function RadioGroup(props: RadioGroupProps): JSX.Element {
  const ariaProps = {};

  props.hideLabel
    ? (ariaProps['aria-label'] = props.groupLabel)
    : (ariaProps['aria-labelledby'] = `${props.name}-groupLabel`);

  return (
    <div
      role="group"
      className={props.className}
      style={props.style}
      {...ariaProps}
    >
      {!props.hideLabel && (
        <div className="txt-l" id={`${props.name}-groupLabel`}>
          {props.groupLabel}
        </div>
      )}

      {props.items.map((item: RadioItem, index: number) => (
        <Radio
          key={`radio-${index}`}
          name={props.name}
          label={item.label}
          value={item.value}
          checked={
            props.checkedValue
              ? item.value === props.checkedValue
              : item.checked
          }
          onChange={props.handleItemChange}
          onBlur={props.handleItemBlur}
          className={`${props.itemsClassName || ''} ${item.className || ''}`}
          style={props.itemsStyle}
        />
      ))}
    </div>
  );
}
