import React from 'react';
import Link from 'next/link';

export interface Props {
  page: number;
  pageCount: number;
  hrefFunc: (p: number) => string;
}

export default function Pagination({ page, pageCount, hrefFunc }: Props) {
  const showPrev = page > 1;
  const showNext = page < pageCount;

  let numberBoxCount = 6;

  if (showPrev) {
    numberBoxCount -= 1;
  }

  if (showNext) {
    numberBoxCount -= 1;
  }

  // Keep a full window of page numbers; when near the end, shift the window
  // left so earlier pages (e.g. 1) stay visible instead of falling off.
  const startNum = Math.max(
    1,
    Math.min(
      page - Math.floor(numberBoxCount / 2) + 1,
      pageCount - numberBoxCount + 1
    )
  );
  const endNum = Math.min(pageCount, startNum + numberBoxCount - 1);

  const boxes: JSX.Element[] = [];
  for (let p = startNum; p <= endNum; ++p) {
    boxes.push(
      <li className="pg-li" key={p}>
        <Link href={hrefFunc(p)}>
          <a
            className={`pg-li-i pg-li-i--link ${
              p === page ? 'pg-li-i--a' : ''
            }`}
          >
            {p}
          </a>
        </Link>
      </li>
    );
  }

  return (
    <ul className="pg">
      {showPrev && (
        <li className="pg-li">
          <Link href={hrefFunc(page - 1)}>
            <a className="pg-li-i pg-li-i--link">≪</a>
          </Link>
        </li>
      )}
      {boxes}
      {showNext && (
        <li className="pg-li">
          <Link href={hrefFunc(page + 1)}>
            <a className="pg-li-i pg-li-i--link">≫</a>
          </Link>
        </li>
      )}
    </ul>
  );
}
