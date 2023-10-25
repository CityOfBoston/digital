/** @jsx jsx */

import { jsx } from '@emotion/core';

import Spinner from '../../Spinner';
import { LOADER_STYLING, NO_RESULTS_STYLING } from './styling';
import { Group, Person, Mode, Loading } from '../../types';
import { LIST_STYLING } from '../styling';
import ListItemComponent from './list';
import Pagination from '../../pagination-components/Pagination';

interface Props {
  mode: Mode;
  loading: Loading;
  items: Array<Array<Person | Group>>;
  currentPage: number;
  pageCount: number;
  pageSize: number;
  viewOnly: boolean;
  handleChange: (item: Group | Person) => void;
  changePage: (currentPage: number) => any;
  handleClick: (item: Group | Person) => void;
  // handleChange: () => void;
  // items: Array<Group | Person>;
  // dns?: [String];
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
export default function EditView(props: Props) {
  const {
    mode,
    items,
    loading,
    viewOnly,
    pageCount,
    pageSize,
    currentPage,
    changePage,
  } = props;

  const handleClick = (item: Group | Person): void => {
    if (props.handleClick) props.handleClick(item);
  };

  const handlePageNumClick = (pageNum, changePage) => {
    changePage(pageNum);
  };

  const handleNextPage = (currentPage, pageCount, changePage) => {
    if (currentPage < pageCount - 1) {
      changePage(currentPage + 1);
    }
  };
  const handlePrevPage = (currentPage, changePage) => {
    if (currentPage > 0) {
      changePage(currentPage - 1);
    }
  };

  const noResultsText =
    props.mode === 'group'
      ? 'This group has no members'
      : 'This person hasn’t been added to any groups';

  if (loading === true) {
    return (
      <div css={LOADER_STYLING}>
        <h1>Mode?: {mode}</h1>
        <Spinner size="3rem" />
      </div>
    );
  } else {
    if (items) console.log('list-components/edit > items: ', items);

    if (items && typeof items === 'object' && items.length > 0) {
      console.log('items[props.currentPage]: ', items[props.currentPage]);
    }

    return (
      <>
        <ul css={LIST_STYLING} key={`${props.mode}_list`}>
          {items && typeof items === 'object' && items.length > 0 ? (
            items[props.currentPage].map((item, index) => (
              <ListItemComponent
                mode={mode}
                item={item}
                key={`${item.displayName}__${index}`}
                keyIndex={`${item.displayName}__${index}`}
                view="management"
                viewOnly={
                  viewOnly && typeof viewOnly === 'boolean' ? viewOnly : false
                }
                isChecked={item.status !== 'remove'}
                handleChange={() => props.handleChange(item)}
                handleClick={handleClick}
              />
            ))
          ) : (
            <li key={`${props.mode}_zero`} css={NO_RESULTS_STYLING}>
              {noResultsText}
            </li>
          )}
        </ul>

        {props.pageCount > 1 && (
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            pageSize={pageSize}
            changePage={changePage}
            handleNextPage={handleNextPage}
            handlePrevPage={handlePrevPage}
            handlePageNumClick={handlePageNumClick}
          />
        )}
      </>
    );
  }
}
