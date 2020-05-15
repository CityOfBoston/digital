/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';

import Head from 'next/head';
import Router from 'next/router';

import {
  AppLayout,
  SectionHeader,
  PUBLIC_CSS_URL,
} from '@cityofboston/react-fleet';

type Props = {
  permitNumber?: string;
  notFound?: boolean;
};

type State = {
  permitNumber: string;
};

export default class IndexPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      permitNumber: props.permitNumber || '',
    };
  }

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    Router.push(`/permit?id=${encodeURIComponent(this.state.permitNumber)}`);
  };

  render() {
    const { notFound } = this.props;
    const { permitNumber } = this.state;

    return (
      <AppLayout>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Boston.gov — Permit Finder</title>
        </Head>

        <div className="b-c b-c--nbp b-c--hsm">
          <SectionHeader title="Permit Finder" />

          <div className="t--intro">
            Enter your permit number below to see the latest information about
            its status.
          </div>

          <div className="m-v500">
            <form
              className="sf sf--md"
              acceptCharset="UTF-8"
              method="get"
              action="/permit"
              onSubmit={this.handleSubmit}
            >
              <div css={SEARCH_ROW_STYLE}>
                <input
                  aria-label="Search box"
                  type="text"
                  name="id"
                  placeholder="Permit #"
                  className="sf-i-f"
                  autoComplete="off"
                  autoFocus
                  value={permitNumber}
                  css={{
                    flex: 1,
                    marginRight: '1rem',
                    paddingRight: '1px',
                    fontSize: '15px',
                  }}
                  onChange={ev =>
                    this.setState({ permitNumber: ev.currentTarget.value })
                  }
                />

                <button className="btn" type="submit">
                  Look Up Permit
                </button>
              </div>

              {notFound && (
                <div className="t--info t--err m-t200">
                  This permit number is not active in the system and was not
                  closed in the past 120 days. Please verify that you have
                  entered a valid, recently active permit number.
                </div>
              )}
            </form>
          </div>

          <div className="m-t700">
            <p style={{ fontWeight: 'bold' }}>
              Don’t know your permit number? Still have questions?
            </p>
            <p>
              Call the Boston Inspectional Services Department at (617)
              635-5300, or the Boston Fire Department at (617) 343-3628.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }
}

const SEARCH_ROW_STYLE = css({
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
});
