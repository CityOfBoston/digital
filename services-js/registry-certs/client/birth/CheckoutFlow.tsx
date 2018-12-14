import React from 'react';
import Head from 'next/head';

import { PageDependencies } from '../../pages/_app';

import PageLayout from '../PageLayout';

import { BREADCRUMB_NAV_LINKS } from './constants';

interface Props extends Pick<PageDependencies, 'birthCertificateRequest'> {}

interface State {}

export default class CheckoutFlow extends React.Component<Props, State> {
  render() {
    return (
      <>
        <Head>
          <title>Boston.gov — Birth Certificates</title>

          <style>{'.txt-f { border-radius: 0; }'}</style>
        </Head>

        <PageLayout breadcrumbNav={BREADCRUMB_NAV_LINKS}>
          <div className="b-c b-c--nbp">
            <h1 className="sh-title">Welcome to the checkout flow</h1>
          </div>
        </PageLayout>
      </>
    );
  }
}
