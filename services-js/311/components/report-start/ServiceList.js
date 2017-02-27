// @flow
import React from 'react';
import { css } from 'glamor';

import type { ServiceSummary } from '../../data/types';

const STYLES = {
  list: css({
    margin: '0.75em 0',
    padding: '0 1em',
    listStyle: 'none',
  }),

  item: css({
    ':before': {
      content: '""',
      borderColor: 'transparent #111',
      borderStyle: 'solid',
      borderWidth: '0.35em 0 0.35em 0.45em',
      display: 'block',
      height: 0,
      width: 0,
      left: '-1em',
      top: '0.9em',
      position: 'relative',
    },
  }),

  link: css({
    textDecoration: 'none',
    textTransform: 'uppercase',
    color: '#37a0e7',
    fontWeight: 500,
    fontSize: 15,
  }),
};

class ServiceButton extends React.Component {
  props: {
    serviceSummary: ServiceSummary,
    onServiceChosen: (serviceSummary: ServiceSummary) => void;
  }

  whenClicked = (ev: SyntheticInputEvent) => {
    const { onServiceChosen, serviceSummary } = this.props;

    ev.preventDefault();
    onServiceChosen(serviceSummary);
  }

  render() {
    const { serviceSummary: { code, name } } = this.props;
    return (
      <li className={STYLES.item} key={code}>
        <a className={STYLES.link} href={`/report/${code}/location`} onClick={this.whenClicked}>{name}</a>
      </li>
    );
  }
}

export type Props = {
  serviceSummaries: ServiceSummary[],
  onServiceChosen: (ServiceSummary) => void,
}

export default function ServiceList({ serviceSummaries, onServiceChosen }: Props) {
  return (
    <ul className={STYLES.list}>{ serviceSummaries.map((s) => <ServiceButton key={s.code} serviceSummary={s} onServiceChosen={onServiceChosen} />) }</ul>
  );
}
