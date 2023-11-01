/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import {
  FREEDOM_RED_DARK,
  OPTIMISTIC_BLUE_DARK,
  SANS,
} from '@cityofboston/react-fleet';

import { Group, Mode, Person } from '../types';

import Spinner from '../Spinner';
import ListItemComponent from './ListItemComponent';
import Pagination from '../pagination-components/Pagination';

import { LIST_STYLING } from './styling';

interface Props {
  items: Array<Group | Person>;
  mode: Mode;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  changePage: (currentPage: number) => any;
  handleChange: (item: Group | Person) => void;
  handleClick: (item: Group | Person) => void;
  dns?: [String];
  loading?: boolean;
  viewOnly?: boolean;
}

/**
 * Component to display an editable list of groups, or list of people
 * (referred to as “items”). Items will contain clickable display text, and
 * a checked box.
 *
 * A checked checkbox indicates an item is a member of the given list. If an
 * item is displayed that represents a value the user does not have permission
 * to change, the checked box is disabled. Unchecking the box will remove that
 * item from the list.
 *
 * editableList reflects the current state of the user’s intended edits.
 */
export default function EditableList(props: Props) {
  const {
    mode,
    items,
    pageSize,
    viewOnly,
    pageCount,
    currentPage,
    changePage,
  } = props;

  const handleClick = (item: Group | Person): void => {
    if (props.handleClick) props.handleClick(item);
  };

  const handlePageNumClick = (pageNum, changePage) => {
    changePage(pageNum);
  };

  const handleNextPage = (
    currentPage: number,
    pageCount: number,
    changePage: any
  ) => {
    if (currentPage < pageCount - 1) {
      changePage(currentPage + 1);
    }
  };
  const handlePrevPage = (currentPage: any, changePage: any) => {
    if (currentPage > 0) {
      changePage(currentPage - 1);
    }
  };

  let filteredItems = items.filter(
    i =>
      i.displayName &&
      typeof i.displayName === 'string' &&
      i.displayName.length > 0
  );

  if (mode && mode === 'group' && filteredItems.length > 0 && !props.loading) {
    filteredItems = filteredItems.sort(
      (a: any, b: any) =>
        b['isAvailable'] - a['isAvailable'] ||
        a['sn'].localeCompare(b['sn']) ||
        a.cn - b.cn
    );
  }

  if (mode && mode === 'person' && filteredItems.length > 0 && !props.loading) {
    filteredItems = filteredItems.sort(
      (a: any, b: any) =>
        b['isAvailable'] - a['isAvailable'] ||
        a['displayName'].localeCompare(b['displayName']) ||
        a.cn - b.cn
    );
  }

  if (filteredItems && filteredItems.length > 0 && props.loading) {
    console.log('filteredItems: ', filteredItems);
  }

  const noResultsText =
    props.mode === 'group'
      ? 'This group has no members'
      : 'This person hasn’t been added to any groups';

  if (props.loading === true) {
    return (
      <div css={LOADER_STYLING}>
        <Spinner size="3rem" />
      </div>
    );
  } else {
    return (
      <>
        <ul css={LIST_STYLING}>
          {filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <ListItemComponent
                key={`${item.displayName}__${index}`}
                view="management"
                handleChange={() => props.handleChange(item)}
                handleClick={handleClick}
                isChecked={item.status !== 'remove'}
                item={item}
                viewOnly={
                  viewOnly && typeof viewOnly === 'boolean' ? viewOnly : false
                }
                mode={mode}
              />
            ))
          ) : (
            <div css={NO_RESULTS_STYLING}>{noResultsText}</div>
          )}
        </ul>

        {pageCount > 1 && (
          <>
            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              pageSize={pageSize}
              changePage={changePage}
              nextPage={handleNextPage}
              prevPage={handlePrevPage}
              handlePageNumClick={handlePageNumClick}
            />
          </>
        )}
      </>
    );
  }
}

const LOADER_STYLING = css({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '3rem',
  color: OPTIMISTIC_BLUE_DARK,
});

const NO_RESULTS_STYLING = css({
  fontFamily: SANS,
  color: FREEDOM_RED_DARK,
});
