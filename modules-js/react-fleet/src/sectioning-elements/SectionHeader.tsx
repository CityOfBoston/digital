import React from 'react';
import hash from 'string-hash';

export type Props = {
  title: string;
  yellow?: boolean;
  subheader?: boolean;
  className?: string;
  id?: string;
};

export default class SectionHeader extends React.Component<Props> {
  /**
   * Useful for determining the ID a <SectionHeader> will get so you can use it
   * with aria-labelledby.
   */
  static makeId(title: string) {
    return `sh-${hash(title)}`;
  }

  render() {
    const { title, yellow, subheader, id, className } = this.props;
    let classes = ['sh', 'm-b300'];

    if (yellow) {
      classes.push('sh--y');
    }

    if (subheader) {
      classes.push('sh--sm');
    }

    return (
      <div className={`${classes.join(' ')} ${className || ''}`}>
        {subheader ? (
          <h3 className="sh-title" id={id || SectionHeader.makeId(title)}>
            {title}
          </h3>
        ) : (
          <h2 className="sh-title" id={id || SectionHeader.makeId(title)}>
            {title}
          </h2>
        )}
      </div>
    );
  }
}
