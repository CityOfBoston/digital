import React from 'react';

export interface CheckboxProps {
  name: string;
  id: any;
  value: any;
  onChange: any;
  onBlur: any;
  title: string;
}

export default class Checkbox extends React.Component<CheckboxProps> {
  render() {
    return (
      <div>
        <label className="cb" htmlFor="Checkbox-${this.props.name}">
          <input
            name="checkbox"
            value="checkbox"
            type="checkbox"
            className="cb-f"
            onChange={this.props.onChange}
            onBlur={this.props.onBlur}
          />
          <span className="cb-l">{this.props.title}</span>
        </label>
      </div>
    );
  }
}
