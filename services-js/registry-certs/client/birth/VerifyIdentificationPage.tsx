import React from 'react';
import Head from 'next/head';

import { observer } from 'mobx-react';

import { PageDependencies } from '../../pages/_app';

import PageWrapper from './PageWrapper';

import VerifyIdentificationComponent from './components/VerifyIdentificationComponent';

interface Props extends Pick<PageDependencies, 'birthCertificateRequest'> {
  sectionsToDisplay?: 'all' | 'supportingDocumentsOnly';
}

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

        <p>[[ order name & # ]]</p>

        <VerifyIdentificationComponent
          sectionsToDisplay={this.props.sectionsToDisplay}
          updateSupportingDocuments={() => {}}
          updateIdImages={() => {}}
        />
      </PageWrapper>
    );
  }
}
