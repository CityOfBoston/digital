import React from 'react';

export interface Props {
  name: string;
  placeholder: string;
  title: string;
  required?: boolean;
}
export default class FormWithElement extends React.Component<Props> {
  render() {
    return (
      <div className="txt m-b300">
        <label
          htmlFor="FeedbackForm-${this.props.name}"
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
          className="txt-f txt-f--sm"
          placeholder={this.props.placeholder}
          id="FeedbackForm-${this.props.name}"
          type="text"
          required={this.props.required}
        />
      </div>
    );
  }
}
