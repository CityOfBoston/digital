import React from 'react';

export interface CheckboxProps {
  name: string;
  id: any;
  label: string;
  value: any;
  onChange: any;
  onBlur: any;
  key: any;
}

export default class Checkbox extends React.Component<CheckboxProps> {
  render() {
    return (
      <div>
        <label className="cb">
          <input
            id={this.props.id}
            name="commissions"
            value="commissions"
            type="checkbox"
            className="cb-f"
            onChange={this.props.onChange}
            onBlur={this.props.onBlur}
          />
        </label>
      </div>
    );
  }
}
