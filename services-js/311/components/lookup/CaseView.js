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

const HEADER_STYLE = css({
  fontSize: 30,
  fontStyle: 'italic',
  marginBottom: 40,
});

const TABLE_CONTAINER_STYLE = css({
  display: 'flex',
  width: '100%',
  flexDirection: 'row',
  alignItems: 'stretch',
});

const TABLE_STYLE = css({
  flex: 1,
  marginRight: 60,
});

const ID_STYLE = css({
  fontWeight: 'bold',
  fontStyle: 'normal',
});

const BUTTON_LINK_STYLE = css({
  display: 'inline-block',
  fontFamily: '"Montserrat", Arial, sans-serif',
  backgroundColor: '#f3a536',
  marginTop: 60,
  color: 'black',
  textDecoration: 'none',
  textTransform: 'uppercase',
  padding: '20px 30px',
});

function renderMissingRequest(query: string) {
  return (
    <p>Case “{query}” not found</p>
  );
}

function renderRequest(request: Request) {
  return (
    <div>
      <h3 className={HEADER_STYLE}>Case Number: <span className={ID_STYLE}>{request.id}</span></h3>
      <div className={TABLE_CONTAINER_STYLE}>
        <ul className={`dl ${TABLE_STYLE.toString()}`}>
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

        <ul className={`dl ${TABLE_STYLE.toString()}`}>
          <li className="dl-i">
            <span className="dl-t">Description</span>
            <span className="dl-d">{ request.description }</span>
          </li>
        </ul>
      </div>

      <Link href="/lookup"><a className={BUTTON_LINK_STYLE}>Back to Search</a></Link>
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
