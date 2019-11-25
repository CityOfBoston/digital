/** @jsx jsx */

import { jsx } from '@emotion/core';
import {
  HOVER_STYLES,
  NORM_HOVER,
  PAGINATION,
} from '../pagination-components/styling';
import { Group, Person } from '../types';

interface Props {
  items: Array<Group | Person>;
  currentPage: number;
  pageCount: number;
  pageSize: number;
  changePage: (currentPage: number) => any;
  handleNextPage: (
    currentPage: number,
    pageCount: number,
    changePage: any
  ) => any;
  handlePrevPage: (currentPage: number, changePage: any) => any;
  handlePageNumClick: (pageNum: number, changePage: any) => any;
}

export default function Pagination(props: Props) {
  const {
    currentPage,
    pageCount,
    changePage,
    handleNextPage,
    handlePrevPage,
  } = props;

  const goToPage = (pageNum: number) => {
    changePage(pageNum);
  };

  const next = () => {
    handleNextPage(currentPage, pageCount, changePage);
  };

  const prev = () => {
    handlePrevPage(currentPage, changePage);
  };

  const lastPage = pageCount - 1;
  const pageSpan = 3;
  const prevPages: number = currentPage - pageSpan;
  let prevPagesArr =
    prevPages > 0
      ? Array.from(Array(prevPages), (_x, index) => currentPage - index)
      : Array.from(
          Array(prevPages + pageSpan),
          (_x, index) => currentPage - index
        ).sort((a, b) => a - b);
  let nextPagesArr = Array.from(
    Array(pageSpan - 1),
    (_x, index) => currentPage + 1 + index
  );

  let prevList1: Array<any> = [];
  if (prevPagesArr.length < 1) {
    let elem = (
      <li className="pg-li" css={NORM_HOVER} key="0">
        <a
          className="pg-li-i pg-li-i--link pg-li-i--a"
          onClick={() => {
            goToPage(1 - 1);
          }}
        >
          1
        </a>
      </li>
    );
    prevList1.push(elem);
  } else {
    prevList1 = prevPagesArr.map((_val, _index) => {
      const cs = 'pg-li-i pg-li-i--link';
      const active = currentPage === _index ? `${cs} pg-li-i--a` : `${cs}`;
      return (
        <li className="pg-li" css={NORM_HOVER} key={_index}>
          <a
            className={active}
            onClick={() => {
              goToPage(_index);
            }}
          >
            {_index + 1}
          </a>
        </li>
      );
    });
  }

  nextPagesArr = nextPagesArr.filter(entry => entry < pageCount);
  let nextList1: Array<any> = nextPagesArr.map((_val, _index) => {
    return (
      <li className="pg-li" css={NORM_HOVER} key={_index}>
        <a
          className="pg-li-i pg-li-i--link"
          onClick={() => {
            goToPage(_val);
          }}
        >
          {_val + 1}
        </a>
      </li>
    );
  });
  return (
    <ul className="pg" css={PAGINATION}>
      <li
        className={currentPage === 0 ? 'pg-li' : 'pg-li prev-next'}
        css={NORM_HOVER}
      >
        {currentPage === 0 ? (
          <span className="pg-li-i">previous</span>
        ) : (
          <a
            className="pg-li-i pg-li-i--a pg-li-i--link"
            css={HOVER_STYLES}
            onClick={prev}
          >
            <span className="pg-li-i-h" onClick={prev}>
              previous
            </span>
          </a>
        )}
      </li>

      {currentPage > pageSpan - 1 ? (
        <li className="pg-li" css={NORM_HOVER} key={currentPage}>
          <a
            className="pg-li-i pg-li-i--link"
            onClick={() => {
              goToPage(0);
            }}
          >
            1...
          </a>
        </li>
      ) : (
        prevList1
      )}
      {currentPage !== 0 && (
        <li
          className="pg-li"
          css={NORM_HOVER}
          key={`${currentPage}_currentPage`}
        >
          <a
            className="pg-li-i pg-li-i--link pg-li-i--a"
            onClick={() => {
              goToPage(currentPage);
            }}
          >
            {currentPage + 1}
          </a>
        </li>
      )}
      {nextList1}

      {currentPage < lastPage && lastPage - currentPage > 2 && (
        <li className="pg-li" css={NORM_HOVER}>
          <a
            className="pg-li-i"
            onClick={() => {
              goToPage(lastPage);
            }}
          >
            {lastPage - currentPage > 3 && '...'}
            {pageCount}
          </a>
        </li>
      )}

      {currentPage < pageCount && (
        <li
          className={currentPage === lastPage ? 'last-li' : 'pg-li prev-next'}
          css={NORM_HOVER}
        >
          {currentPage === lastPage ? (
            <a className="pg-li-i pg-li-i--link last-link">next</a>
          ) : (
            <a
              className="pg-li-i pg-li-i--a pg-li-i--link"
              css={HOVER_STYLES}
              onClick={next}
            >
              <span className="pg-li-i-h">next</span>
            </a>
          )}
        </li>
      )}
    </ul>
  );
}
