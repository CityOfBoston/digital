// @flow
import React from 'react';

import type { Service } from '../../store/modules/services';

export default class ServiceList extends React.Component {
  props: {
    services: ?Service[],
    servicesError: ?Object,
    onCodeChosen: (string) => void,
  }

  handleServiceClick = (ev: SyntheticInputEvent) => {
    ev.preventDefault();
    this.props.onCodeChosen(ev.target.value);
  }

  render() {
    const { services, servicesError } = this.props;

    if (servicesError) {
      return <h2>{servicesError.message}</h2>;
    }

    return (
      <ul>
        { services && services.map(this.renderServiceButton) }
      </ul>
    );
  }

  renderServiceButton = ({ name, code }: Service) => (
    <li key={code}>
      <button type="submit" name="code" value={code} onClick={this.handleServiceClick}>{name}</button>
    </li>
  );
}
