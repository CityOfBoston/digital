import React from 'react';
import Head from 'next/head';

import { observer } from 'mobx-react';

import { PageDependencies } from '../../pages/_app';

import PageWrapper from './PageWrapper';

import VerifyIdentificationComponent from './components/VerifyIdentificationComponent';

import { SECTION_HEADING_STYLING } from './styling';

interface Props extends Pick<PageDependencies, 'birthCertificateRequest'> {}

/**
 * ID verification page. User is directed here by a Registry employee.
 */
@observer
export default class VerifyIdentificationPage extends React.Component<Props> {
  // private handleSubmit = () => {
  // todo: upload to db; show success/error confirmation
  // };

  render() {
    const pageTitle = 'Verify your identification';

    return (
      <PageWrapper>
        <Head>
          <title>Boston.gov — {pageTitle}</title>
        </Head>

        <h2 className={SECTION_HEADING_STYLING}>{pageTitle}</h2>

        <p>[[ order name & # ]]</p>

        <VerifyIdentificationComponent />
      </PageWrapper>
    );
  }
}
