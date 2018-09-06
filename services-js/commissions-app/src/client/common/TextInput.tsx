import React from 'react';

export interface Props {
  name: string;
  placeholder?: string;
  title: string;
  error?: string;
  required?: boolean;
  value: string;
  onChange: any;
  onBlur: any;
  style?: object;
  className?: string;
}

export default class FormWithElement extends React.Component<Props> {
  render() {
    return (
      <div className={`txt m-b300 ${this.props.className || ''}`} style={this.props.style}>
        <label
          htmlFor={`FeedbackForm-${this.props.name}`}
          className="txt-l txt-l--sm"
        >
          {this.props.title}

          {this.props.required && (
            <span className="t--req" aria-hidden="true">
              {' '}
              Required
            </span>
          )}
        </label>

        <input
          name={this.props.name}
          className={`
            txt-f txt-f--sm
            ${this.props.error ? ' txt-f--err' : ''}
          `}
          placeholder={this.props.placeholder || ''}
          value={this.props.value}
          id={`FeedbackForm-${this.props.name}`}
          type="text"
          required={this.props.required}
          onChange={this.props.onChange}
          onBlur={this.props.onBlur}
        />

        {this.props.error && (
          <div className="t--subinfo t--err m-t100">{this.props.error}</div>
        )}
      </div>
    );
  }
}
