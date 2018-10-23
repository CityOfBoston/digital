import React, { TextareaHTMLAttributes } from 'react';

export interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
  small?: boolean;
  hideLabel?: boolean;
  error?: false | string | Object;
}

export default function Textarea({
  name,
  label,
  small,
  hideLabel,
  error,
  rows,
  ...textareaProps
}: Props): JSX.Element {
  const id = `FeedbackForm-${name}`;

  return (
    <div className="txt">
      {!hideLabel && (
        <label htmlFor={id} className={`txt-l ${small ? 'txt-l--sm' : ''}`}>
          {label}
        </label>
      )}
      <textarea
        aria-label={hideLabel ? label : ''}
        rows={rows || 10}
        name={name}
        className={`txt-f ${small ? 'txt-f--sm' : ''} ${
          error ? 'txt-f--err' : ''
        } `}
        id={id}
        {...textareaProps}
      />
    </div>
  );
}
