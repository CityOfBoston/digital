import React from 'react';

export interface Props {
  name: string;
  title: string;
  value: string;
  onChange: any;
  onBlur: any;
}

export default class CheckboxElement extends React.Component<Props> {
  render() {
    return (
      <div className="txt m-b300">
        <label
          className="txt-l txt-l--sm"
          htmlFor="checkbox-${this.props.name}"
        />
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
