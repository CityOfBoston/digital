import React from 'react';
import Head from 'next/head';

import FeedbackBanner from '../common/FeedbackBanner';
import Footer from '../common/Footer';
import Nav from '../common/Nav';
import SectionHeader from '../common/SectionHeader';

import CaseView from './CaseView';

import { Request } from '../../data/types';
import loadCase from '../../data/queries/load-case';
import { GetInitialProps } from '../../pages/_app';
import { getParam } from '@cityofboston/next-client-common';

type CaseData = {
  request: Request | null;
};

type Props = {
  id: string;
  data: CaseData;
};

export default class CaseLayout extends React.Component<Props> {
  static getInitialProps: GetInitialProps<
    Props,
    'query' | 'res',
    'fetchGraphql'
  > = async ({ query, res }, { fetchGraphql }) => {
    const id = getParam(query.id);

    if (!id) {
      throw new Error('id missing in CaseLayout');
    }

    const request = await loadCase(fetchGraphql, id);

    if (res && !request) {
      res.statusCode = 404;
    }

    const data = {
      request,
    };

    return { data, id };
  };

  render() {
    const { data } = this.props;

    return (
      <div>
        <Head>
          <title>BOS:311 — {this.renderTitle()}</title>
        </Head>

        <Nav activeSection="search" />

        <div className="b-c mn--full" role="main">
          {data.request && <CaseView request={data.request} />}
          {!data.request && this.renderNotFound()}
        </div>

        <Footer />
        <FeedbackBanner fit="PAGE" />
      </div>
    );
  }

  renderTitle() {
    const request = this.props.data.request;

    if (request) {
      return `Case #${request.id}`;
    } else {
      return 'Case not found';
    }
  }

  renderNotFound() {
    const { id } = this.props;

    return (
      <div style={{ minHeight: '50vh' }}>
        <SectionHeader>Case not found</SectionHeader>

        <div className="m-v400 t--intro">
          We couldn’t find case number <strong>{id}</strong>.
        </div>

        <div className="m-v400 t--info">
          Please double-check the case number and try again.
        </div>

        <div className="m-v400 t--info">
          Some cases are not available on this website because they contain
          sensitive or private information.
        </div>

        <div className="m-v400 t--info">
          If you need help finding the status of your case, please call our
          operators at <a href="tel:311">311</a> (outside of Boston, dial{' '}
          <a href="tel:+16176354501">617-635-4500</a>).
        </div>
      </div>
    );
  }
}
