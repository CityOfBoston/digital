import React from 'react';


export interface Props {
  name: string;
  placeholder: string;
  label: string;
  error?: string;
  value: string;
  onChange: any;
  onBlur: any;
  variant?: string;
  hideLabel?: boolean;
  rows?: number;
}

export default function Textarea(props: Props): JSX.Element {
  return (
    <div className="txt">
      {!props.hideLabel && (
        <label
          htmlFor={`FeedbackForm-${props.name}`}
          className={`txt-l ${props.variant === 'small' && 'txt-l--sm'}`}
        >
          {props.label}
        </label>
      )}

      <textarea
        aria-label={props.hideLabel ? props.label : ''}
        rows={props.rows || 10}
        name={props.name}
        className={`txt-f ${props.variant === 'small' && 'txt-f--sm'} ${props.error ? 'txt-f--err' : ''} `}

        placeholder={props.placeholder}
        value={props.value}
        id={`FeedbackForm-${props.name}`}
        onChange={props.onChange}
        onBlur={props.onBlur}
      />
    </div>
  );
}
