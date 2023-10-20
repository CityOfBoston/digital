/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Group, Person, Mode, Loading } from '../../types';
import Spinner from '../../Spinner';
import { LOADER_STYLING, NO_RESULTS_STYLING } from './Styling__EditView';
// import { LIST_STYLING } from '../styling';

interface Props {
  mode: Mode;
  loading: Loading;
  items: Array<Group | Person>;
  currentPage?: number;
  pageCount?: number;
  pageSize?: number;
  // items: Array<Group | Person>;
  // handleChange: (item: Group | Person) => void;
  // handleClick: (item: Group | Person) => void;
  // dns?: [String];
  // changePage: (currentPage: number) => any;
  // viewOnly?: boolean;
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
  const { mode, loading, items } = props;
  let filteredItems = [];
  console.log('filteredItems:items: ', items);

  if (items && items.length > 0) {
    items.filter(
      i =>
        i.displayName &&
        typeof i.displayName === 'string' &&
        i.displayName.length > 0
    );

    if (
      mode &&
      mode === 'group' &&
      filteredItems.length > 0 &&
      !props.loading
    ) {
      filteredItems = filteredItems.sort(
        (a: any, b: any) =>
          b['isAvailable'] - a['isAvailable'] ||
          a['sn'].localeCompare(b['sn']) ||
          a.cn - b.cn
      );
    }

    if (
      mode &&
      mode === 'person' &&
      filteredItems.length > 0 &&
      !props.loading
    ) {
      filteredItems = filteredItems.sort(
        (a: any, b: any) =>
          b['isAvailable'] - a['isAvailable'] ||
          a['displayName'].localeCompare(b['displayName']) ||
          a.cn - b.cn
      );
    }

    if (filteredItems && filteredItems.length > 0 && props.loading) {
      console.log('filteredItems 2: ', filteredItems);
    }
    console.log('items!!!!: ', filteredItems);
  }
  // console.log('filteredItems: ', filteredItems);

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
    console.log('list-components/edit > items: ', items);
    return (
      <>
        Edit View!
        <ul>
          {filteredItems && filteredItems.length > 0 ? (
            <li>List ...</li>
          ) : (
            <div css={NO_RESULTS_STYLING}>{noResultsText}</div>
          )}
        </ul>
      </>
    );
  }
}
