import React from 'react';
import hash from 'string-hash';


/**
 * Stateless component for rendering a text-like form element. (Type of "text",
 * "tel", "password", &c.)
 *
 * Automatically generates an id for the element if one is not provided. Also
 * automatically adds the "txt-f" class to the element, and the "txt-f--err"
 * class if there's an error.
 *
 * If hideLabel is specified, the label text will be added as an aria-label
 * attribute on the input element.
 */
interface Props {
  label: string;
  type?: string;
  small?: boolean;
  hideLabel?: boolean;

  id?: string;
  className?: string;
  style?: object;
  name?: string;
  defaultValue?: string;
  placeholder?: string;

  required?: boolean;
  inputMode?: string;
  maxLength?: number;
  minLength?: number;

  value?: string;
  disabled?: boolean;
  error?: string | boolean;

  onBlur?(e: any): void;
  onChange?(e: any): void;
  onFocus?(e: any): void;
}

export default function TextInput(props: Props): JSX.Element {
  const id = props.id || `input-${hash(props.label)}`;

  const classNames = {
    label: `txt-l ${props.small ? 'txt-l--sm' : ''}`,
    input: `txt-f ${props.small ? 'txt-f--sm' : ''} ${props.error ? 'txt-f--err' : ''}`
  };

  return (
    <div className={props.className} style={props.style}>
      <label
        htmlFor={id}
        className={classNames.label}
      >
        {props.hideLabel ?
          <>&nbsp;</>

          :

          <span style={{ marginRight: '0.5em', whiteSpace: 'nowrap' }}>
            {props.label}
          </span>
        }

        {props.required && <span className="t--req">Required</span>}
      </label>

      <input
        className={classNames.input}
        id={id}
        aria-label={props.hideLabel ? props.label : ''}
        type={props.type || 'text'}
        name={props.name}
        placeholder={props.placeholder}

        value={props.value}
        defaultValue={props.defaultValue}
        disabled={props.disabled}

        required={props.required}
        inputMode={props.inputMode}
        maxLength={props.maxLength}
        minLength={props.minLength}


        onBlur={props.onBlur}
        onChange={props.onChange}
        onFocus={props.onFocus}
      />

      <div className="t--subinfo t--err m-b100">
        {/* The &nbsp; is to keep space for the error so the form doesn't jump when one is added. */}
        {props.error && typeof props.error === 'string' ?
          props.error

          :

          <>&nbsp;</>
        }
      </div>
    </div>
  );
}
