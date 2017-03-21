// @flow

import React from 'react';
import { css } from 'glamor';
import Link from 'next/link';

import type { Request } from '../../data/types';

import SectionHeader from '../common/SectionHeader';

export type Props = {
  query: string,
  request: ?Request,
}

const CONTAINER_STYLE = css({
  padding: '60px 100px',
});

const RESULT_STYLE = css({
  padding: '0px 60px',
});

function renderMissingRequest(query: string) {
  return (
    <p>Case “{query}” not found</p>
  );
}

function renderRequest(request: Request) {
  return (
    <div>
      <h3 className="t--intro m-v500">Case Number: <span className="t--number">{request.id}</span></h3>
      <hr className="hr hr--dash m-v300" />
      <div className="g">
        <ul className="dl g--6">
          <li className="dl-i">
            <span className="dl-t">Opened</span>
            <span className="dl-d">{ request.requestedAtString }</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Where</span>
            <span className="dl-d">{ request.address }</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Title</span>
            <span className="dl-d">{ request.service.name }</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Status</span>
            <span className="dl-d">{ request.status }</span>
          </li>
          <li className="dl-i">
            <span className="dl-t">Updated</span>
            <span className="dl-d">{ request.updatedAtString }</span>
          </li>
        </ul>

        <ul className="dl g--6">
          <li className="dl-i">
            <span className="dl-t">Description</span>
            <span className="dl-d">{ request.description }</span>
          </li>
        </ul>
      </div>

      <div className="m-v500">
        <div className="g">
          <Link href="/lookup"><a className="g--33 ta-c btn btn--y">Back to Search</a></Link>
        </div>
      </div>
    </div>
  );
}

export default function CaseView({ query, request }: Props) {
  return (
    <div className={CONTAINER_STYLE}>
      <SectionHeader>Case Search</SectionHeader>
      <div className={RESULT_STYLE}>
        { !request && renderMissingRequest(query) }
        { request && renderRequest(request) }
      </div>
    </div>
  );
}
