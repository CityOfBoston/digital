// @flow

import React from 'react';
import { css } from 'glamor';
import Link from 'next/link';

import type { Request } from '../../data/types';

import SectionHeader from '../common/SectionHeader';
import SearchForm from './SearchForm';

export type Props = {|
  query: string,
  request: ?Request,
  searchFunc: (q: string) => Promise<void>,
|}

const CONTAINER_STYLE = css({
  padding: '60px 100px',
});

const RESULT_STYLE = css({
  padding: '0px 60px',
});

const STEP_OVERRIDE_STYLE = css({
  margin: '5rem 0 6rem',
  textTransform: 'none !important',
});

const NUMBER_OVERRIDE_STYLE = css({
  marginRight: '1.5rem !important',
});

const SECOND_NUMBER_OVERRIDE_STYLE = css(NUMBER_OVERRIDE_STYLE, {
  alignSelf: 'flex-start',
  marginTop: 3,
});

function renderMissingRequest(query, searchFunc) {
  return (
    <div>
      <p className="t--info">There is no case number matching “{query}”.</p>

      <div className={`stp ${STEP_OVERRIDE_STYLE.toString()}`}>
        <span className={`stp-number ${NUMBER_OVERRIDE_STYLE.toString()}`}>1</span>
        <SearchForm fromCaseView searchFunc={searchFunc} />
      </div>

      <div className={`stp ${STEP_OVERRIDE_STYLE.toString()}`}>
        <span className={`stp-number ${SECOND_NUMBER_OVERRIDE_STYLE.toString()}`}>2</span>
        <span className="t--intro">
          Our 311 operators are available 24/7 to help point you <br />
          in the right direction. Call <a href="tel:311">311</a>, or <a href="tel:+16176354500">617-635-4500</a>.
        </span>
      </div>
    </div>
  );
}

function renderRequest(request: Request) {
  return (
    <div className={RESULT_STYLE}>
      <h3 className="t--intro m-v500">Case Number: <span className="t--number">{request.id}</span></h3>
      <hr className="hr hr--dash m-v300" />
      <div className="g">
        <ul className="dl g--6">
          <li className="dl-i">
            <span className="dl-t">Opened</span>
            <span className="dl-d dl-d--tt-n">{ request.requestedAtString }</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Where</span>
            <span className="dl-d dl-d--tt-n">{ request.address }</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Title</span>
            <span className="dl-d dl-d--tt-n">{ request.service.name }</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Status</span>
            <span className="dl-d dl-d--tt-n">{ request.status }</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Updated</span>
            <span className="dl-d dl-d--tt-n">{ request.updatedAtString }</span>
          </li>
        </ul>

        <ul className="dl g--6">
          <li className="dl-i">
            <span className="dl-t">Description</span>
            <span className="dl-d dl-d--tt-n">{ request.description }</span>
          </li>
        </ul>
      </div>

      <div className="g m-v500">
        <Link href="/lookup"><a className="g--3 ta-c btn btn--y">Back to Search</a></Link>
      </div>
    </div>
  );
}

function renderHeaderText(request: ?Request): string {
  return request ? 'Case Search' : 'No results found';
}

export default function CaseView({ query, request, searchFunc }: Props) {
  return (
    <div className={CONTAINER_STYLE}>
      <SectionHeader>{renderHeaderText(request)}</SectionHeader>

      { !request && renderMissingRequest(query, searchFunc) }
      { request && renderRequest(request) }
    </div>
  );
}
