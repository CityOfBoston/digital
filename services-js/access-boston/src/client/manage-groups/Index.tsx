/** @jsx jsx */

import { jsx } from '@emotion/core';

import { useEffect, useReducer } from 'react';

import { Group, Mode, Person, View } from './types';

import { reducer as stateReducer, initialState } from './state/app';
import { reducer as listReducer } from './state/list';

import InitialView from './InitialView';
import ManagementView from './ManagementView';
import ReviewChangesView from './ReviewChangesView';

import EditableList from './list-components/EditableList';
import SearchComponent from './search-component/SearchComponent';

import {
  fetchGroupMembers,
  fetchPersonsGroups,
} from './fixtures/fetch-list-data';

import {
  fetchGroupsSearchResults,
  fetchPeopleSearchResults,
  fetchRemainingGroups,
  fetchRemainingPeople,
} from './fixtures/fetch-search-results';

/**
 * Definitions:
 * - user: the app owner currently logged in
 * - group: item representing a LDAP group
 * - person: item representing a City person
 */
export default function Index() {
  const [state, dispatchState] = useReducer(stateReducer, initialState);
  const [list, dispatchList] = useReducer(listReducer, []);

  const changeView = (newView: View) =>
    dispatchState({ type: 'CHANGE_VIEW', view: newView });

  const changeMode = (newMode: Mode) =>
    dispatchState({ type: 'CHANGE_MODE', mode: newMode });

  const changeSelected = (selectedItem: Group | Person) => {
    dispatchState({ type: 'SET_SELECTED', selected: selectedItem });
  };

  // const resetAll = () => {
  //   dispatchState({ type: 'RESET_STATE' });
  //   dispatchList({ type: 'CLEAR_LIST' });
  // };

  const handleInitialSelection = (selectedItem: any) => {
    changeSelected(selectedItem);
    changeView('management');
  };

  const handleClickListItem = (item: Group | Person) => {
    changeSelected(item);
    changeMode(state.mode === 'group' ? 'person' : 'group');
  };

  // Once a selection is made, populate the list and update suggestions.
  useEffect(() => {
    const {
      mode,
      selected: { groups, members },
    } = state;

    if (mode === 'group') {
      if (members && members.length > 0) {
        fetchGroupMembers(members).then(result =>
          dispatchList({
            type: 'LOAD_LIST',
            list: result,
          })
        );
      }
    } else {
      if (groups && groups.length > 0) {
        fetchPersonsGroups(groups, []).then(result =>
          dispatchList({
            type: 'LOAD_LIST',
            list: result,
          })
        );
      }
    }
  }, [state.selected]);

  const handleToggleItem = (item: Group | Person) => {
    dispatchList({ type: 'TOGGLE_ITEM_STATUS', item });
  };

  const handleAddToList = (item: Group | Person) =>
    dispatchList({ type: 'ADD_ITEM', item });
  //
  // const handleRemoveFromList = (item: Group | Person) =>
  //   dispatchList({ type: 'REMOVE_ITEM', item });
  //
  // const handleClearList = () => dispatchList({ type: 'CLEAR_LIST' });
  //
  // // Updates status for a given item appearing in the list.
  // const handleListItemChange = (item: Group | Person) => {
  //   const action = item.status !== 'remove' ? 'REMOVE_ITEM' : 'RETURN_ITEM';
  //
  //   dispatchList({ type: action, cn: item.cn });
  // };

  // Convenience method.
  const inverseMode = (): Mode => {
    if (state.mode === 'person') {
      return 'group';
    } else {
      return 'person';
    }
  };

  switch (state.view) {
    case 'management':
      return (
        <div css={CONTAINER_STYLING}>
          <ManagementView
            mode={state.mode}
            selected={state.selected}
            changeView={changeView}
            list={list}
            searchComponent={
              <SearchComponent
                mode={inverseMode()}
                view="management"
                handleFetch={
                  inverseMode() === 'group'
                    ? fetchRemainingGroups
                    : fetchRemainingPeople
                }
                handleSelectClick={handleAddToList}
                selectedItem={state.selected}
              />
            }
            editableList={
              <EditableList
                mode={state.mode}
                items={list}
                handleChange={handleToggleItem}
                handleClick={handleClickListItem}
              />
            }
          />
        </div>
      );

    case 'review':
      return (
        <div css={CONTAINER_STYLING}>
          <ReviewChangesView
            mode={state.mode}
            selected={state.selected}
            changeView={changeView}
            items={list}
          />
        </div>
      );

    default:
      return (
        <div css={CONTAINER_STYLING}>
          <InitialView
            mode={state.mode}
            changeMode={changeMode}
            searchComponent={
              <SearchComponent
                mode={state.mode}
                view="initial"
                handleFetch={
                  state.mode === 'group'
                    ? fetchGroupsSearchResults
                    : fetchPeopleSearchResults
                }
                handleSelectClick={handleInitialSelection}
              />
            }
          />
        </div>
      );
  }
}

const CONTAINER_STYLING: any = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
};
