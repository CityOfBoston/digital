import React from 'react';
import AppLayout from '../layouts/AppLayout';
import SectionHeader from '../sectioning-elements/SectionHeader';

const PARAGRAPH_CLASSES = 'm-v500 lh--400 t--s500';

type Props = {
  statusCode: number;
};

/**
 * Page component to export from Next.js’s pages/_error.tsx.
 *
 * Sends exceptions to Rollbar if it’s available, and renders a Boston-branded
 * error page.
 */
export default class ErrorPage extends React.Component<Props> {
  static getInitialProps({ res, err }) {
    const errStatusCode = err ? err.statusCode : null;
    const statusCode = res ? res.statusCode : errStatusCode;

    if (
      (process as any).browser &&
      (window as any).Rollbar &&
      err &&
      !err._reportedException
    ) {
      (window as any).Rollbar.error(err);
      err._reportedException = true;
    }

    return { statusCode };
  }

  render() {
    const { statusCode } = this.props;

    return (
      <AppLayout>
        <div className="b-c b-c--nbp">
          {statusCode === 404 ? this.render404() : this.render500()}
        </div>
      </AppLayout>
    );
  }

  render404() {
    return (
      <>
        <SectionHeader title="This page could not be found" />

        <p className={PARAGRAPH_CLASSES}>
          If that doesn’t seem right, please{' '}
          <a href="https://www.boston.gov/contact">contact us</a> and let us
          know.
        </p>

        <p className={PARAGRAPH_CLASSES}>
          Visit <a href="https://www.boston.gov/">Boston.gov</a> for
          announcements about ongoing technical problems.
        </p>
      </>
    );
  }

  render500() {
    return (
      <>
        <SectionHeader title="Something went wrong!" />

        <div className="m-v500 t--intro">
          We had a technical issue that we didn't know how to handle, but our
          staff is working to fix it.
        </div>

        <p className={PARAGRAPH_CLASSES}>
          You can try to refresh this page to see if it resolves the problem. We
          also post announcements about ongoing technical issues on{' '}
          <a href="https://www.boston.gov/">Boston.gov</a>.
        </p>
      </>
    );
  }
}
