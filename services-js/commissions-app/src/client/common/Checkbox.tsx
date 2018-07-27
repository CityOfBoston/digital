import React from 'react';

export interface CheckboxProps {
  name: string;
  value: string;
  onChange: any;
  required?: boolean;
  error?: string;
  onBlur: any;
  title: string;
  checked: boolean;
}

export default class Checkbox extends React.Component<CheckboxProps> {
  render() {
    return (
      <label className="cb">
        <input
          name={this.props.name}
          value={this.props.value}
          required={this.props.required}
          type="checkbox"
          className="cb-f"
          onChange={this.props.onChange}
          onBlur={this.props.onBlur}
          checked={this.props.checked}
        />
        {this.props.error && (
          <div className="t--subinfo t--err m-t100">{this.props.error}</div>
        )}
        <span className="cb-l">{this.props.title}</span>
      </label>
    );
  }
}
