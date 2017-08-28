// @flow
/* eslint react/prefer-stateless-function: 0 react/no-unused-prop-types: 0 */

import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import type { Context } from 'next';
import { css } from 'glamor';
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';

import type { RequestAdditions } from '../../server/next-handlers';

import type { ServiceSummary } from '../../data/types';
import type { AppStore } from '../../data/store';
import type { Group } from '../../data/store/AllServices';
import makeLoopbackGraphql from '../../data/dao/loopback-graphql';
import loadServiceSummaries from '../../data/dao/load-service-summaries';

import Nav from '../common/Nav';
import SectionHeader from '../common/SectionHeader';
import { CHARLES_BLUE } from '../style-constants';

type InitialProps = {
  services: ServiceSummary[],
};

type Props = InitialProps & {
  store: AppStore,
};

type GroupProps = {
  group: Group,
  services: ServiceSummary[],
};

const SERVICE_LINK_STYLE = css({
  display: 'inline-block',
  verticalAlign: 'middle',
});

@observer
class ServicesLayoutGroup extends React.Component<GroupProps> {
  @action.bound
  toggle() {
    const { group } = this.props;
    group.open = !group.open;
  }

  render() {
    const { group, services } = this.props;

    const regionId = `${group.id.replace(/\s/g, '-')}-region`;

    return (
      <div className={`dr ${group.open ? 'dr--open' : ''}`} key={group.id}>
        <button
          className="dr-h"
          type="button"
          onClick={this.toggle}
          aria-expanded={group.open}
          aria-controls={regionId}
        >
          <div className="dr-ic">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 8.5 18 25">
              <path
                className="dr-i"
                d="M16 21L.5 33.2c-.6.5-1.5.4-2.2-.2-.5-.6-.4-1.6.2-2l12.6-10-12.6-10c-.6-.5-.7-1.5-.2-2s1.5-.7 2.2-.2L16 21z"
              />
            </svg>
          </div>
          <h2 className="dr-t">
            {group.name}
          </h2>
          <div className="dr-st">
            {group.description}
          </div>
        </button>

        <VelocityTransitionGroup
          enter={{ animation: 'slideDown', duration: 250 }}
          leave={{ animation: 'slideUp', duration: 250 }}
          role="region"
          id={regionId}
        >
          {group.open &&
            <div className="dr-c" style={{ display: 'block' }}>
              <ul className="ul" key="content">
                {services.map(({ name, code, description }) =>
                  <li key={code}>
                    <Link
                      href={`/request?code=${code}`}
                      as={`/request/${code}`}
                    >
                      <a className={`${SERVICE_LINK_STYLE.toString()} p-a300`}>
                        <div className="t--sans tt-u">
                          {name}
                        </div>
                        <div style={{ color: CHARLES_BLUE }}>
                          {description}
                        </div>
                      </a>
                    </Link>
                  </li>
                )}
              </ul>
            </div>}
        </VelocityTransitionGroup>
      </div>
    );
  }
}

export default class ServicesLayout extends React.Component<Props> {
  static async getInitialProps({
    req,
  }: Context<RequestAdditions>): Promise<InitialProps> {
    const loopbackGraphql = makeLoopbackGraphql(req);
    const services = await loadServiceSummaries(loopbackGraphql);

    return {
      services,
    };
  }

  render() {
    const { store } = this.props;

    const servicesByGroup = {};
    const otherServices = [];

    store.allServices.groups.forEach(g => {
      servicesByGroup[g.id.toLowerCase()] = [];
    });

    this.props.services.forEach(s => {
      if (s.group && servicesByGroup[s.group.toLowerCase()]) {
        servicesByGroup[s.group.toLowerCase()].push(s);
      } else {
        otherServices.push(s);
      }
    });

    return (
      <div>
        <Head>
          <title>BOS:311 — All BOS:311 Services</title>
        </Head>

        <Nav activeSection="services" />

        <div className="b b--g">
          <div className="b-c">
            <SectionHeader>All BOS:311 Services</SectionHeader>

            <div>
              {store.allServices.groups.map(g =>
                <ServicesLayoutGroup
                  key={g.id}
                  group={g}
                  services={servicesByGroup[g.id.toLowerCase()]}
                />
              )}

              {otherServices.length > 0 &&
                <ServicesLayoutGroup
                  group={store.allServices.otherGroup}
                  services={otherServices}
                />}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
