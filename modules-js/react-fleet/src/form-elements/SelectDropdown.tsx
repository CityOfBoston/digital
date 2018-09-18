import React, { SelectHTMLAttributes } from 'react';
import hash from 'string-hash';


interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | boolean;

  variant?: 'small';
  hideLabel?: boolean;
  hideBlank?: boolean;
  options: string[];
}

/**
 * Stateless dropdown select component.
 *
 * Automatically generates an id for the element if one is not provided.
 *
 * If hideLabel is specified, the label text will be added as an aria-label
 * attribute on the select element.
 *
 * todo: at narrow widths, padding visually obscures current selection
 *
 * todo: currently assumes it will receive an array of strings to create its <option>s; there may be cases when we want an option to have a different value from its displayed text, and pass in an array of objects instead. - 9/21 jm
 */
export default function SelectDropdown(props: Props): JSX.Element {
  const { error, hideLabel, label, required, variant } = props;
  const id = props.id || `select-${hash(label)}`;

  const classNames = {
    label: `txt-l ${variant === 'small' ? 'txt-l--sm' : ''}`,
    container: `sel-c ${variant === 'small' ? 'sel-c--thin' : ''} ${error ? 'sel-c--err' : ''}`,
    select: `sel-f ${variant === 'small' ? 'sel-f--thin' : ''} ${error ? 'sel-f--err' : ''}`
  };

  return (
    <div className={props.className} style={props.style}>
      <label
        htmlFor={id}
        className={classNames.label}
      >
        {hideLabel ?
          <React.Fragment>&nbsp;</React.Fragment>

          :

          <span style={{ marginRight: '0.5em', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        }

        {required && <span className="t--req">Required</span>}
      </label>

      <div className={classNames.container}>
        <select
          id={id}
          className={classNames.select}
          aria-label={hideLabel ? label : ''}
          name={props.name}

          value={props.value}
          defaultValue={props.defaultValue}
          disabled={props.disabled}
          required={required}

          onBlur={props.onBlur}
          onChange={props.onChange}
          onFocus={props.onFocus}
        >
          {!props.hideBlank && <option />}

          {props.options.map(option => (
            <option key={`${id}_${option}`}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
