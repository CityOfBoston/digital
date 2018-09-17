import React, { InputHTMLAttributes } from 'react';
import hash from 'string-hash';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | boolean;

  id?: string;
  type?: string;

  placeholder?: string;
  variant?: string;
  style?: object;
}

/**
 * Stateless component for rendering a text-like form element. (Type of "text",
 * "tel", "password", &c.)
 *
 * Automatically generates an id for the element if one is not provided. Also
 * automatically adds the "txt-f" class to the element, and the "txt-f--err"
 * class if there's an error.
 *
 * All props besides "label" and "error" are passed along as props for the
 * <input> element.
 */
export default function TextInput(props: Props) {
  const { error, required, label } = props;
  const id = props.id || `input-${hash(label)}`;

  const inputProps = Object.assign({ id, type: 'text' }, props, {
    className: `${props.className || ''} txt-f ${props.variant === 'small' && 'txt-f--sm'} ${error ? 'txt-f--err' : ''}`,
  });

  // These aren't used for <input> elements
  delete inputProps.error;
  delete inputProps.label;

  return (
    <div className="txt" style={props.style ||{}}>
      <label htmlFor={id} className={`txt-l ${props.variant === 'small' && 'txt-l--sm'}`}>
        {label}

        {required && (
          <span className="t--req" aria-hidden="true">
            {' '}
            Required
          </span>
        )}
      </label>

      <input {...inputProps} />

      <div className="t--subinfo t--err m-t100">
        {/* The &nbsp; is to keep space for the error so the form doesn't jump when one is added. */}
        {error && typeof error === 'string' ? error : <>&nbsp;</>}
      </div>
    </div>
  );
}
