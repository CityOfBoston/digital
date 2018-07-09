import React from 'react';

export interface Props {
  name: string;
  title: string;
  value: string;
  onChange: any;
  onBlur: any;
  property: any;
}

export default class Checkbox extends React.Component<Props> {
  render() {
    return (
      <div>
        <label className="cb" htmlFor="checkbox-${this.props.name}" />
        <input
          id="checkbox-${this.props.name}"
          name={this.props.name}
          type="checkbox"
          className="cb-f"
          onChange={this.props.onChange}
          onBlur={this.props.onBlur}
          value={this.props.value}
        />
      </div>
    );
  }
}
