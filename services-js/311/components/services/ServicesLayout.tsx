import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'emotion';
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';
import getConfig from 'next/config';
import { makeFetchGraphql } from '@cityofboston/next-client-common';
import { CHARLES_BLUE } from '@cityofboston/react-fleet';

import { ServiceSummary } from '../../data/types';
import { Group } from '../../data/store/AllServices';
import loadServiceSummaries from '../../data/queries/load-service-summaries';

import FeedbackBanner from '../common/FeedbackBanner';
import Footer from '../common/Footer';
import Nav from '../common/Nav';
import SectionHeader from '../common/SectionHeader';
import { PageDependencies } from '../../pages/_app';

type InitialProps = {
  services: ServiceSummary[];
};

type Props = InitialProps & Pick<PageDependencies, 'allServices'>;

type GroupProps = {
  group: Group;
  services: ServiceSummary[];
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

    const sortedServices = [...services];
    sortedServices.sort((s1, s2) => s1.name.localeCompare(s2.name));

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
          <h2 className="dr-t">{group.name}</h2>
          <div className="dr-st">{group.description}</div>
        </button>

        <VelocityTransitionGroup
          enter={{ animation: 'slideDown', duration: 250 }}
          leave={{ animation: 'slideUp', duration: 250 }}
          role="region"
          id={regionId}
        >
          {group.open && (
            <div className="dr-c" style={{ display: 'block' }}>
              <ul className="ul" key="content">
                {sortedServices.map(({ name, code, description }) => (
                  <li key={code}>
                    <Link
                      href={`/request?code=${code}`}
                      as={`/request/${code}`}
                    >
                      <a className={`${SERVICE_LINK_STYLE.toString()} p-a300`}>
                        <div className="t--sans tt-u">{name}</div>
                        <div style={{ color: CHARLES_BLUE }}>{description}</div>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </VelocityTransitionGroup>
      </div>
    );
  }
}

export default class ServicesLayout extends React.Component<Props> {
  static async getInitialProps(): Promise<InitialProps> {
    const fetchGraphql = makeFetchGraphql(getConfig());
    const services = await loadServiceSummaries(fetchGraphql);

    return {
      services,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyEvents);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyEvents);
  }

  @action.bound
  handleKeyEvents(event: KeyboardEvent) {
    const { allServices } = this.props;

    // Expand drawers so users can search within them easily.
    // Check for CTRL+f input.
    if (event.keyCode == 70 && (event.ctrlKey || event.metaKey)) {
      allServices.groups.forEach(g => {
        g.open = true;
      });
    }

    // Check for ESC input.
    if (event.keyCode == 27) {
      allServices.groups.forEach(g => {
        g.open = false;
      });
    }
  }

  render() {
    const { allServices, services } = this.props;

    const servicesByGroup: { [id: string]: ServiceSummary[] } = {};
    const otherServices: ServiceSummary[] = [];

    allServices.groups.forEach(g => {
      servicesByGroup[g.id.toLowerCase()] = [];
    });

    services.forEach(s => {
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

        <div className="mn--full ">
          <div className="b b--g">
            <div className="b-c">
              <SectionHeader>All BOS:311 Services</SectionHeader>

              <div>
                {allServices.groups.map(g => {
                  const services = servicesByGroup[g.id.toLowerCase()];
                  return (
                    !!services.length && (
                      <ServicesLayoutGroup
                        key={g.id}
                        group={g}
                        services={services}
                      />
                    )
                  );
                })}

                {otherServices.length > 0 && (
                  <ServicesLayoutGroup
                    group={allServices.otherGroup}
                    services={otherServices}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />
        <FeedbackBanner fit="PAGE" />
      </div>
    );
  }
}
