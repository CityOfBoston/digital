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
  disableLabelNoWrap?: boolean;
  labelBelowInput?: boolean;
  optionalDescription?: string;

  required?: boolean;
  softRequired?: boolean;
  toolTip?: { icon: string; msg: string };
  focused?: boolean;
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

import { ToolTip } from '../ToolTip';

export default function TextInput(props: Props): JSX.Element {
  const { toolTip, focused } = props;

  const id = props.id || `input-${hash(props.label)}`;

  const classNames = {
    label: `txt-l ${props.small ? 'txt-l--sm' : ''}`,
    input: `txt-f ${props.small ? 'txt-f--sm' : ''} ${
      props.error ? 'txt-f--err' : ''
    } ${focused ? ' txt-f--focused' : ''}${
      props.softRequired &&
      props.error &&
      typeof props.error === 'string' &&
      props.error.length > 0
        ? ' txt-f--sr'
        : ''
    }`,
  };

  const labelText = (label): React.ReactChild => {
    if (typeof label === 'string') {
      let styleObj = { marginRight: '0.5em', display: 'flex' };
      if (!props.disableLabelNoWrap) {
        styleObj['whiteSpace'] = 'nowrap';
      }

      return <span style={styleObj}>{label}</span>;
    } else {
      return label;
    }
  };

  const optionalDescriptionElem = optionalDescription => {
    const cont = 'notice css-content-psedo';
    return <label className={cont}>{optionalDescription}</label>;
  };

  const requireStr = () => {
    const { softRequired } = props;
    let retStr = `Required`;
    if (typeof softRequired === 'boolean' && softRequired === false) {
      retStr = `Optional`;
    }

    return retStr;
  };

  let cssObj_labelReq = { 't--req': 't--req' };

  if (typeof props.softRequired === 'boolean' && props.softRequired === false) {
    cssObj_labelReq['t--opt'] = 't--opt';
  }

  // Filter out object key/value with empty strings eq. ``
  Object.keys(cssObj_labelReq).forEach(
    k => cssObj_labelReq[k] == '' && delete cssObj_labelReq[k]
  );

  // Output obj values as string of classNames
  let cssArrToString: string = Object.keys(cssObj_labelReq)
    .map(obj => cssObj_labelReq[obj])
    .toString()
    .replace(/,/g, ' ');

  const labelElem = () => {
    const modLabelStyle = {
      marginTop: '1em',
      marginBottom: '2em',
      display: 'flex',
    };
    const optStyles = props.labelBelowInput
      ? modLabelStyle
      : { display: 'flex' };

    return (
      <label htmlFor={id} className={classNames.label} style={optStyles}>
        {props.hideLabel ? <>&nbsp;</> : labelText(props.label)}

        {/* Because “required” attribute is set on <input> element, */}
        {/* hide this from screen readers to cut down on repetition. */}
        {((typeof props.required === 'boolean' && props.required === true) ||
          (typeof props.softRequired === 'boolean' &&
            props.softRequired === true)) && (
          <span
            className={`${cssArrToString}`}
            aria-hidden="true"
            style={{ display: 'flex', flexGrow: 1 }}
          >
            {requireStr()}
            {toolTip && ToolTip({ icon: `${toolTip.icon}`, msg: toolTip.msg })}
          </span>
        )}
      </label>
    );
  };

  const spacer = () => {
    return (
      <div className="t--subinfo t--err m-b100 m-t100">
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
      {!props.labelBelowInput && labelElem()}
      {props.labelBelowInput && spacer()}
      {props.optionalDescription &&
        props.optionalDescription.length > 0 &&
        optionalDescriptionElem(props.optionalDescription)}

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

      {props.labelBelowInput && labelElem()}
      {!props.labelBelowInput && spacer()}
    </div>
  );
}
