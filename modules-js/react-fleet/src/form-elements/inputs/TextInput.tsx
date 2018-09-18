import React, { InputHTMLAttributes } from 'react';
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
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | boolean;

  variant?: 'small';
  hideLabel?: boolean;
}

export default function TextInput(props: Props): JSX.Element {
  const { error, hideLabel, label, required, variant } = props;
  const id = props.id || `input-${hash(label)}`;

  const classNames = {
    label: `txt-l ${variant === 'small' ? 'txt-l--sm' : ''}`,
    input: `txt-f ${variant === 'small' ? 'txt-f--sm' : ''} ${error ? 'txt-f--err' : ''}`
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

      <input
        style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        className={classNames.input}
        id={id}
        aria-label={hideLabel ? label : ''}
        type={props.type || 'text'}
        name={props.name}
        placeholder={props.placeholder}

        value={props.value}
        defaultValue={props.defaultValue}
        disabled={props.disabled}

        required={required}
        inputMode={props.inputMode}
        maxLength={props.maxLength}
        minLength={props.minLength}


        onBlur={props.onBlur}
        onChange={props.onChange}
        onFocus={props.onFocus}
      />

      <div className="t--subinfo t--err m-t100">
        {/* The &nbsp; is to keep space for the error so the form doesn't jump when one is added. */}
        {error && typeof error === 'string' ?
          error

          :

          <React.Fragment>&nbsp;</React.Fragment>
        }
      </div>
    </div>
  );
}
