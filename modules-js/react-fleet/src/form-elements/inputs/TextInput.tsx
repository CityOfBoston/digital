import React from 'react';
import hash from 'string-hash';

/**
 * Stateless component for rendering a text-like form element. (Type of “text”,
 * “tel”, “password”, &c.)
 *
 * If necessary, an element can be passed in as the “label” property instead
 * of text. Its child elements should only contain plain text. The most common
 * case would be several sibling <span>s:
 *
 * label={
 *  <>
 *    <span style={{ whiteSpace: 'nowrap' }}>Label will be very long</span>
 *    <wbr />
 *    <span style={{ whiteSpace: 'nowrap' }}>
 *      and we want some control over how the browser will break the text
 *    </span>
 *  </>
 *  }
 *
 * Automatically generates an id for the element if one is not provided. Will
 * also add the “txt-f” class to the element, and the “txt-f--err” class if
 * there’s an error.
 *
 * If “hideLabel” is specified, the label text must be a string; it will be
 * added as an aria-label attribute on the <input> element.
 */
type Props = {
  type?: string;
  small?: boolean;

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
  onKeyDown?(e: any): void;
} & (
  | {
      hideLabel?: true;
      label: string;
    }
  | {
      hideLabel?: false | undefined;
      label: string | React.ReactChild;
    });

export default function TextInput(props: Props): JSX.Element {
  const id = props.id || `input-${hash(props.label)}`;

  const classNames = {
    label: `txt-l ${props.small ? 'txt-l--sm' : ''}`,
    input: `txt-f ${props.small ? 'txt-f--sm' : ''} ${
      props.error ? 'txt-f--err' : ''
    }`,
  };

  const labelText = (label): React.ReactChild => {
    if (typeof label === 'string') {
      return (
        <span style={{ marginRight: '0.5em', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      );
    } else {
      return label;
    }
  };

  return (
    <div className={props.className} style={props.style}>
      <label htmlFor={id} className={classNames.label}>
        {props.hideLabel ? <>&nbsp;</> : labelText(props.label)}

        {/* Because “required” attribute is set on <input> element, */}
        {/* hide this from screen readers to cut down on repetition. */}
        {props.required && (
          <span className="t--req" aria-hidden="true">
            Required
          </span>
        )}
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
        onKeyDown={props.onKeyDown}
      />

      <div className="t--subinfo t--err m-b100">
        {/* The &nbsp; is to keep space for the error so the form doesn’t jump when one is added. */}
        {props.error && typeof props.error === 'string' ? (
          props.error
        ) : (
          <>&nbsp;</>
        )}
      </div>
    </div>
  );
}
