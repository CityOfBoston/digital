/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Group, Person, Mode, Loading } from '../../types';
import Spinner from '../../Spinner';
import { LOADER_STYLING, NO_RESULTS_STYLING } from './styling';
import ListItemComponent from './list';
import { LIST_STYLING } from '../styling';

interface Props {
  mode: Mode;
  loading: Loading;
  items: Array<Array<Group | Person>>;
  currentPage: number;
  pageCount?: number;
  pageSize?: number;
  viewOnly?: boolean;
  handleChange: () => void;
  // handleChange: (item: Group | Person) => void;
  // items: Array<Group | Person>;
  // handleClick: (item: Group | Person) => void;
  // dns?: [String];
  // changePage: (currentPage: number) => any;
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
  const { mode, loading, items, viewOnly, handleChange } = props;

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
    // console.log('list-components/edit > items: ', items);
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
                handleChange={handleChange}
              />
            ))
          ) : (
            <li key={`${props.mode}_zero`} css={NO_RESULTS_STYLING}>
              {noResultsText}
            </li>
          )}
        </ul>
      </>
    );
  }
}
