// @flow

import React from 'react';
import Link from 'next/link';

export type Props = {|
  page: number,
  pageCount: number,
  hrefFunc: (p: number) => string,
|}

export default function Pagination({ page, pageCount, hrefFunc }: Props) {
  const showPrev = page > 1;
  const showNext = page < pageCount;

  const startNum = Math.max(page - 2, 1);
  const endNum = Math.min(pageCount, page + 2);

  const boxes = [];
  for (let p = startNum; p <= endNum; ++p) {
    boxes.push(
      <li className="pg-li" key={p}>
        <Link href={hrefFunc(p)}><a className={`pg-li-i pg-li-i--link ${p === page ? 'pg-li-i--a' : ''}`}>{p}</a></Link>
      </li>,
      );
  }

  return (
    <ul className="pg">
      { showPrev &&
        <li className="pg-li">
          <Link href={hrefFunc(page - 1)}><a className="pg-li-i pg-li-i--link">≪</a></Link>
        </li>
      }
      { boxes }
      { showNext &&
        <li className="pg-li">
          <Link href={hrefFunc(page + 1)}><a className="pg-li-i pg-li-i--link">≫</a></Link>
        </li>
      }
    </ul>
  );
}
