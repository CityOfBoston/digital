import React from 'react';

export interface Props {
  name: string;
  placeholder: string;
  label: string;
  small?: boolean;
  hideLabel?: boolean;
  rows?: number;
  error?: false | string | Object;
  value: string;

  onChange?(e: any): void;
  onBlur?(e: any): void;
}

export default function Textarea(props: Props): JSX.Element {
  return (
    <div className="txt">
      {!props.hideLabel && (
        <label
          htmlFor={`FeedbackForm-${props.name}`}
          className={`txt-l ${props.small ? 'txt-l--sm' : ''}`}
        >
          {props.label}
        </label>
      )}

      <textarea
        aria-label={props.hideLabel ? props.label : ''}
        rows={props.rows || 10}
        name={props.name}
        className={`txt-f ${props.small ? 'txt-f--sm' : ''} ${
          props.error ? 'txt-f--err' : ''
        } `}
        placeholder={props.placeholder}
        value={props.value}
        id={`FeedbackForm-${props.name}`}
        onChange={props.onChange}
        onBlur={props.onBlur}
      />
    </div>
  );
}
