import React from 'react';

export type Props = {
  title: string;
  yellow?: boolean;
};

export default class SectionHeader extends React.Component<Props> {
  static defaultProps: Partial<Props> = {
    yellow: false,
  };

  render() {
    const { title, yellow } = this.props;

    const classes = ['sh'];
    if (yellow!) {
      classes.push('sh--y');
    }

    return (
      <div className={classes.join(' ')}>
        <h2 className="sh-title">{title}</h2>
      </div>
    );
  }
}
