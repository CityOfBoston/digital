import React from 'react';

export type Props = {
  title: string;
  yellow?: boolean;
  subheader?: boolean;
  className?: string;
};

export default function SectionHeader(props: Props): JSX.Element {
  const { title, yellow, subheader } = props;
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
    <div className={`${classes.join(' ')} ${props.className || ''}`}>
      {props.subheader ?
        <h3 className="sh-title">{title}</h3>
        :
        <h2 className="sh-title">{title}</h2>
      }
    </div>
  );
}
