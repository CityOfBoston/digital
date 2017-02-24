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

export default class ServiceList extends React.Component {
  props: {
    serviceSummaries: ServiceSummary[],
    onCodeChosen: (string) => void,
  }

  handleServiceClick = (ev: SyntheticInputEvent) => {
    ev.preventDefault();

    const code = ev.target.getAttribute('data-code');
    if (code) {
      this.props.onCodeChosen(code);
    }
  }

  render() {
    const { serviceSummaries } = this.props;
    return (
      <ul className={STYLES.list}>{ serviceSummaries.map(this.renderServiceButton) }</ul>
    );
  }

  renderServiceButton = ({ name, code }: ServiceSummary) => (
    <li className={STYLES.item} key={code}>
      <a className={STYLES.link} href={`/report/${code}/location`} data-code={code} onClick={this.handleServiceClick}>{name}</a>
    </li>
  );
}
