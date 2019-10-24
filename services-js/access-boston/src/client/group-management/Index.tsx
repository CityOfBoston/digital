/** @jsx jsx */

import { jsx } from '@emotion/core';

import { useEffect, useReducer, useState } from 'react';

import { Group, Mode, Person, View } from './types';

import { reducer as stateReducer, initialState } from './state/app';
import { reducer as listReducer } from './state/list';

import InitialView from './InitialView';
import ManagementView from './ManagementView';
import ReviewChangesView from './ReviewChangesView';
import ReviewConfirmationView from './ReviewConfirmationView';

import EditableList from './list-components/EditableList';
import SearchComponent from './search-component/SearchComponent';

import {
  fetchGroupSearch,
  fetchGroupSearchRemaining,
  fetchPersonsGroups,
} from './data-fetching/fetch-group-data';
import {
  fetchGroupMembers,
  fetchPersonSearch,
  fetchPersonSearchRemaining,
} from './data-fetching/fetch-person-data';

interface Props {
  groups: any;
  // mode: Mode;
  // changeMode: (mode: Mode) => void;
  // searchComponent: ReactNode;
}

/**
 * Definitions:
 * - user: the app owner currently logged in
 * - group: item representing a LDAP group
 * - person: item representing a City person
 */
export default function Index(props: Props) {
  const { groups } = props;
  // console.log('GROUPS!!!!!: ', groups);
  const [state, dispatchState] = useReducer(stateReducer, initialState);
  const [list, dispatchList] = useReducer(listReducer, []);
  const [loading, setLoading] = useState<boolean>(false);

  const changeView = (newView: View): void =>
    dispatchState({ type: 'APP/CHANGE_VIEW', view: newView });

  const changeMode = (newMode: Mode): void =>
    dispatchState({ type: 'APP/CHANGE_MODE', mode: newMode });

  const changeSelected = (selectedItem: Group | Person): void => {
    dispatchState({ type: 'APP/SET_SELECTED', selected: selectedItem });
  };

  const resetAll = (): void => {
    dispatchState({ type: 'APP/RESET_STATE' });
    dispatchList({ type: 'LIST/CLEAR_LIST' });
  };

  const handleInitialSelection = (selectedItem: any): void => {
    changeSelected(selectedItem);
    changeView('management');
  };

  const handleClickListItem = (item: Group | Person): void => {
    changeSelected(item);
    changeMode(state.mode === 'group' ? 'person' : 'group');
  };

  const handleFetchGroupMembers = (
    selected: Group,
    dns: String[] = []
  ): void => {
    const { members } = selected;

    if (members && members.length > 0) {
      setLoading(true);

      fetchGroupMembers(selected, dns).then(result => {
        dispatchList({
          type: 'LIST/LOAD_LIST',
          list: result,
        });

        setLoading(false);
      });
    }
  };

  const handleFetchPersonsGroups = (
    selected: Person,
    dns: String[] = []
  ): void => {
    const { groups } = selected;

    if (groups && groups.length > 0) {
      setLoading(true);

      fetchPersonsGroups(selected, [], dns).then(result => {
        dispatchList({
          type: 'LIST/LOAD_LIST',
          list: result,
        });

        setLoading(false);
      });
    }
  };

  // Once a selection is made, populate the list and update suggestions.
  useEffect(() => {
    const { mode, selected } = state;
    if (mode === 'group') {
      if (selected.cn) handleFetchGroupMembers(selected, groups);
    } else {
      if (selected.cn) handleFetchPersonsGroups(selected, groups);
    }
  }, [state.selected]);

  const handleToggleItem = (item: Group | Person) => {
    dispatchList({ type: 'LIST/TOGGLE_ITEM_STATUS', item });
  };

  const handleAddToList = (item: Group | Person) =>
    dispatchList({ type: 'LIST/ADD_ITEM', item });
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
            loading={loading}
            searchComponent={
              <SearchComponent
                mode={inverseMode()}
                view="management"
                currentUserAllowedGroups={[]}
                handleFetch={
                  inverseMode() === 'group'
                    ? fetchGroupSearchRemaining
                    : fetchPersonSearchRemaining
                }
                handleSelectClick={handleAddToList}
                selectedItem={state.selected}
                dns={groups}
              />
            }
            editableList={
              <EditableList
                mode={state.mode}
                items={list}
                loading={loading}
                handleChange={handleToggleItem}
                handleClick={handleClickListItem}
              />
            }
            resetAll={resetAll}
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
            resetAll={resetAll}
            items={list}
          />
        </div>
      );

    case 'confirmation':
      return (
        <div css={CONFIRMATION_CONTAINER_STYLING}>
          <ReviewConfirmationView
            mode={state.mode}
            selected={state.selected}
            changeView={changeView}
            resetAll={resetAll}
            items={list}
          />
        </div>
      );
    default:
      // const stateModeMethod = state.mode === 'group' ? fetchGroupSearch : fetchPersonSearch;
      // console.log('Index > state.view > default: dns(groups)', groups);
      // console.log('stateModeMethod: ', state.mode === 'group', stateModeMethod, '\n----------');
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
                  state.mode === 'group' ? fetchGroupSearch : fetchPersonSearch
                }
                handleSelectClick={handleInitialSelection}
                dns={groups}
              />
            }
          />
        </div>
      );
  }
}

const CONTAINER_STYLING: any = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
};

const CONFIRMATION_CONTAINER_STYLING: any = {
  display: 'flex',
  flexDirection: 'column',
};
