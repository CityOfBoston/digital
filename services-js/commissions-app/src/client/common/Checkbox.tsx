import React from 'react';

export interface CheckboxProps {
  name: string;
  value: string;
  onChange: any;
  onBlur: any;
  title: string;
}

export default class Checkbox extends React.Component<CheckboxProps> {
  render() {
    return (
      <label className="cb">
        <input
          name={this.props.name}
          value={this.props.value}
          type="checkbox"
          className="cb-f"
          onChange={this.props.onChange}
          onBlur={this.props.onBlur}
        />
        <span className="cb-l">{this.props.title}</span>
      </label>
    );
  }
}
