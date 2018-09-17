import React from 'react';

export type Props = {
  title: string;
  yellow?: boolean;
  subheader?: boolean;
};

export default class SectionHeader extends React.Component<Props> {
  static defaultProps: Partial<Props> = {
    yellow: false,
  };

  render() {
    const { title, yellow, subheader } = this.props;

    const classes = [
      'sh',
      'm-b300'
    ];

    if (yellow!) {
      classes.push('sh--y');
    }

    if (subheader) {
      classes.push('sh--sm');
    }

    return (
      <div className={classes.join(' ')}>
        {this.props.subheader ?

          <h3 className="sh-title">{title}</h3>
          :
          <h2 className="sh-title">{title}</h2>
        }
      </div>
    );
  }
}
