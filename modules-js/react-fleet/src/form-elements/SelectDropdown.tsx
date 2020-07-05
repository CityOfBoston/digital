import React from 'react';
import hash from 'string-hash';

interface Options {
  label: string;
  value: string;
}

interface Props {
  label: string;
  small?: boolean;
  hideLabel?: boolean;
  hideBlankOption?: boolean;
  options: string[] | Options[];

  id?: string;
  className?: string;
  style?: object;
  name?: string;
  defaultValue?: string;
  required?: boolean;
  disableLabelNoWrap?: boolean;
  labelBelowInput?: boolean;

  value?: string;
  disabled?: boolean;
  error?: string | boolean;

  onBlur?(e: any): void;
  onChange?(e: any): void;
  onFocus?(e: any): void;
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
  const id = props.id || `select-${hash(props.label)}`;

  const classNames = {
    label: `txt-l ${props.small ? 'txt-l--sm' : ''}`,
    container: `sel-c ${props.small ? 'sel-c--thin' : ''} ${
      props.error ? 'sel-c--err' : ''
    }`,
    select: `sel-f ${props.small ? 'sel-f--thin' : ''} ${
      props.error ? 'sel-f--err' : ''
    }`,
  };

  const opts = (_options: any) => {
    if (typeof _options[0] === 'object') {
      return _options.map((option: { value: any; label: React.ReactNode }) => (
        <option key={`${id}_${option.value}`} value={option.value}>
          {option.label}
        </option>
      ));
    } else {
      return _options.map((option: React.ReactNode) => (
        <option key={`${id}_${option}`}>{option}</option>
      ));
    }
  };

  const labelElem = (label): React.ReactChild => {
    const modLabelStyle = { marginTop: '1em', marginBottom: '2em' };
    const optStyles = props.labelBelowInput ? modLabelStyle : {};
    let styleObj = { marginRight: '0.5em' };
    if (!props.disableLabelNoWrap) {
      styleObj['whiteSpace'] = 'nowrap';
    }

    return (
      <label htmlFor={id} className={classNames.label} style={optStyles}>
        {props.hideLabel ? <>&nbsp;</> : <span style={styleObj}>{label}</span>}
        {props.required && <span className="t--req">Required</span>}
      </label>
    );
  };

  const spacer = () => {
    return (
      <div className="t--subinfo t--err m-b100">
        {/* The &nbsp; is to keep space for the error so the form doesn’t jump when one is added. */}
        {props.error && typeof props.error === 'string' ? (
          props.error
        ) : (
          <>&nbsp;</>
        )}
      </div>
    );
  };

  return (
    <div className={props.className} style={props.style}>
      {!props.labelBelowInput && labelElem(props.label)}
      {props.labelBelowInput && spacer()}

      <div className={classNames.container}>
        <select
          id={id}
          className={classNames.select}
          aria-label={props.hideLabel ? props.label : ''}
          name={props.name}
          value={props.value}
          defaultValue={props.defaultValue}
          disabled={props.disabled}
          required={props.required}
          onBlur={props.onBlur}
          onChange={props.onChange}
          onFocus={props.onFocus}
        >
          {!props.hideBlankOption && <option />}

          {opts(props.options)}
        </select>
      </div>

      {props.labelBelowInput && labelElem(props.label)}
    </div>
  );
}
