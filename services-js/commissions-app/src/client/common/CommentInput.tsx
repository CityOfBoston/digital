import React from 'react';


export interface Props {
  name: string;
  placeholder: string;
  title?: string;
  error?: string;
  value: string;
  onChange: any;
  onBlur: any;
}

export default function Comments(props: Props): JSX.Element {
  return (
    <div className="txt">
      <label
        htmlFor={`FeedbackForm-${props.name}`}
        className="txt-l txt-l--sm"
      >
        {props.title ? props.title : undefined}
      </label>

      <textarea
        rows={10}
        name={props.name}
        className={`txt-f txt-f--sm ${props.error ? 'txt-f--err' : ''} `}

        placeholder={props.placeholder}
        value={props.value}
        id={`FeedbackForm-${props.name}`}
        onChange={props.onChange}
        onBlur={props.onBlur}
      />
    </div>
  );
}
