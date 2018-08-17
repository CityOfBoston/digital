import React, { ReactElement } from 'react';

export interface InputElArgument {
  id: string;
  required: boolean;
  className: string;
}

type InputElFunction = (arg: InputElArgument) => ReactElement<any>;

interface Props {
  title: string;
  error?: string | boolean;
  required?: boolean;
  children: InputElFunction;
}

interface State {
  id: string;
}

let nextId = 0;

export default class TextInputWrapper extends React.Component<Props, State> {
  state = {
    id: `text-input-${nextId++}`,
  };

  render() {
    const { id } = this.state;

    const { error, required } = this.props;

    const inputEl =
      typeof this.props.children === 'function'
        ? this.props.children({
            id,
            required: !!required,
            className: error ? 'txt-f txt-f--err' : 'txt-f',
          })
        : this.props.children;

    return (
      <div className="txt" style={{ marginBottom: '0.5rem' }}>
        <label htmlFor={id} className="txt-l" style={{ marginTop: 0 }}>
          {this.props.title}

          {this.props.required && (
            <span className="t--req" aria-hidden="true">
              {' '}
              Required
            </span>
          )}
        </label>

        {inputEl}

        <div className="t--subinfo t--err m-t100">
          {this.props.error && typeof this.props.error === 'string' ? (
            this.props.error
          ) : (
            <>&nbsp;</>
          )}
        </div>
      </div>
    );
  }
}
