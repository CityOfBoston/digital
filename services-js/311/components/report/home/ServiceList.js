// @flow
import React from 'react';

import type { ServiceSummary } from '../../../data/types';

class ServiceButton extends React.Component {
  props: {
    serviceSummary: ServiceSummary,
    onServiceChosen: (code: string) => mixed,
  }

  whenClicked = (ev: SyntheticInputEvent) => {
    const { onServiceChosen, serviceSummary } = this.props;

    ev.preventDefault();
    onServiceChosen(serviceSummary.code);
  }

  render() {
    const { serviceSummary: { code, name } } = this.props;
    return (
      <li key={code}>
        <a className="t--sans tt-u" href={`/report/${code}`} onClick={this.whenClicked}>{name}</a>
      </li>
    );
  }
}

export type Props = {
  serviceSummaries: ServiceSummary[],
  onServiceChosen: (code: string) => mixed,
}

export default function ServiceList({ serviceSummaries, onServiceChosen }: Props) {
  return (
    <ul className="ul">{ serviceSummaries.map((s) => <ServiceButton key={s.code} serviceSummary={s} onServiceChosen={onServiceChosen} />) }</ul>
  );
}
