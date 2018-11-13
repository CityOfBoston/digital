// @flow

import React from 'react';
import Link from 'next/link';
import { css } from 'glamor';
import { GRAY_300, GREEN, YELLOW } from '../style-constants';
import type { SearchCase } from '../../data/types';

const CONTAINER_STYLE = css({
  background: 'white',
  display: 'flex',
  alignItems: 'stretch',
  boxSizing: 'content-box',
  height: '4.5rem',
  padding: '0.5rem',
});

const THUMBNAIL_SYLE = css({
  width: '4.5rem',
  height: '4.5rem',
  margin: '0 1rem 0 0',
  flexShrink: 0,
  backgroundSize: 'cover',
});

const INFO_CONTAINER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  flex: 1,
  overflow: 'hidden',
});

const SERVICE_NAME_STYLE = css({
  lineHeight: '1 !important',
});

const ADDRESS_STYLE = css({
  color: GRAY_300,
  fontFamily: 'Lora, Georgia, serif',
  flex: 1,
});

const STATUS_COMMON_STYLE = css({
  color: 'white',
  padding: '0.1111rem 0.555555rem',
  marginRight: '0.6666666rem',
  fontSize: 12,
});

const STATUS_OPEN_STYLE = css(STATUS_COMMON_STYLE, {
  backgroundColor: GREEN,
});

const STATUS_CLOSE_STYLE = css(STATUS_COMMON_STYLE, {
  backgroundColor: YELLOW,
});

type Props = {|
  caseInfo: SearchCase,
|}

export default function RequestPopup({ caseInfo }: Props) {
  let statusStyle;
  let statusText;

  if (caseInfo.status === 'open') {
    statusStyle = STATUS_OPEN_STYLE;
    statusText = 'Opened';
  } else {
    statusStyle = STATUS_CLOSE_STYLE;
    statusText = 'Closed';
  }

  return (
    <Link href={`/case?id=${caseInfo.id}`} as={`/case/${caseInfo.id}`}>
      <a className={`p-a200 ${CONTAINER_STYLE.toString()}`}>
        { caseInfo.mediaUrl &&
          <div className={THUMBNAIL_SYLE} style={{ backgroundImage: `url(${caseInfo.mediaUrl})` }} />
        }
        <div className={INFO_CONTAINER_STYLE.toString()}>
          <div className={`t--intro ${SERVICE_NAME_STYLE.toString()}`}>{ caseInfo.service.name }</div>
          <div className={`t--ellipsis ${ADDRESS_STYLE.toString()}`}>{ caseInfo.address }</div>
          <div>
            <span className={`t--upper t--sans ${statusStyle.toString()}`}>{statusText}</span>
          </div>
        </div>
      </a>
    </Link>
  );
}
