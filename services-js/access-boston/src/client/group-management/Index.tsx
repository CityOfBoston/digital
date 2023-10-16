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

// import EditableList from './list-components/EditableList';
import SearchComponent from './search-component/SearchComponent';

import {
  fetchGroupSearch,
  fetchGroupSearchRemaining,
  fetchPersonsGroups,
  fetchOurContainers,
  fetchDataURL,
  fetchMinimumUserGroups,
} from './data-fetching/fetch-group-data';
import {
  fetchGroupMembers,
  fetchPersonSearch,
  fetchPersonSearchRemaining,
} from './data-fetching/fetch-person-data';
import { renameObjectKeys, chunkArray } from './fixtures/helpers';
import { pageSize } from './types';

interface Props {
  groups: any;
}

/**
 * Definitions:
 * - user: the app owner currently logged in
 * - group: item representing a LDAP group
 * - person: item representing a City person
 */
export default function Index(props: Props) {
  const { groups } = props;
  const [state, dispatchState] = useReducer(stateReducer, initialState);
  const [list, dispatchList] = useReducer(listReducer, []);
  const [loading, setLoading] = useState<boolean>(false);
  const viewOnly =
    groups.includes('SG_AB_GRPMGMT_SERVICEDESKVIEWONLY') &&
    groups.filter((str: string | string[]) => str.includes('_GRPMGMT_'))
      .length === 1;

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

  // const changePage = (currentPage: number): void => {
  //   dispatchState({ type: 'APP/CHANGE_PAGE', currentPage });
  //   const { mode, selected } = state;
  //   if (mode === 'group') {
  //     if (
  //       selected.cn &&
  //       selected.chunked[currentPage] &&
  //       selected.chunked[currentPage].length > 0
  //     )
  //       handleFetchGroupMembers(selected, groups, currentPage);
  //   } else {
  //     if (
  //       selected.cn &&
  //       selected.chunked[currentPage] &&
  //       selected.chunked[currentPage].length > 0
  //     )
  //       handleFetchPersonsGroups(selected, groups, currentPage);
  //   }
  // };

  // const changePageCount = (pageCount: number): void => {
  //   dispatchState({ type: 'APP/CHANGE_PAGECOUNT', pageCount });
  // };

  const handleInitialSelection = (selectedItem: any): void => {
    changeSelected(selectedItem);
    changeView('management');
  };

  // const handleClickListItem = (item: Group | Person): void => {
  //   changeSelected(item);
  //   changeMode(state.mode === 'group' ? 'person' : 'group');
  // };

  const handleAdminListItemClick = (item: any): void => {
    changeSelected(item);
    changeView('management');
  };

  const setApiUrl = async () => {
    const apiURL =
      process.env.GROUP_MANAGEMENT_API_URL || (await fetchDataURL());
    if (state.api === '') {
      dispatchState({
        type: 'APP/SET_API',
        api: apiURL,
      });
    }
  };

  const setOus = async () => {
    fetchOurContainers(groups).then(result => {
      console.log('convertOUsToContainers result: ', result);
      if (result !== null) {
        dispatchState({
          type: 'APP/SET_OUS',
          ous: result.convertOUsToContainers,
        });
      }
    });
  };

  const getAdminMinGroups = async () => {
    fetchMinimumUserGroups(groups).then(result => {
      if (result !== null && result.getMinimumUserGroups !== null) {
        let ret = result.getMinimumUserGroups.map((entry: Group | Person) => {
          let remappedObj = renameObjectKeys(
            { uniquemember: 'members', memberof: 'members', member: 'members' },
            entry
          );
          remappedObj['chunked'] =
            remappedObj['members'] && remappedObj['members'].length > -1
              ? chunkArray(remappedObj['members'], pageSize)
              : [];
          remappedObj['isAvailable'] = true;
          remappedObj['status'] = 'current';
          return remappedObj;
        });

        dispatchState({
          type: 'APP/SET_ADMIN_MIN_GROUPS',
          dns: ret,
        });
      }
    });
  };

  // const handleFetchGroupMembers = (
  //   selected: Group,
  //   dns: String[] = [],
  //   _currentPage: number = 0
  // ): void => {
  //   const { members, chunked } = selected;
  //   const mask_chunked = chunked ? chunked : [];
  //   changePageCount(mask_chunked.length);

  //   if (members && members.length > 0) {
  //     setLoading(true);
  //     fetchGroupMembers(selected, dns, _currentPage).then(result => {
  //       dispatchList({
  //         type: 'LIST/LOAD_LIST',
  //         list: result,
  //       });

  //       setLoading(false);
  //     });
  //   }
  // };

  const handleFetch_GroupMembers = async (selected: Group): Promise<void> => {
    // const { members, chunked } = selected;
    // console.log('members | chunked: ', members, chunked);
    const group_members = await fetchGroupMembers(selected.dn);
    console.log(
      'group_members: ',
      typeof group_members,
      Object.keys(group_members),
      Object.keys(group_members)[0],
      group_members[Object.keys(group_members)[0]].length,
      group_members
    );
    // console.log('fetchGroupMembers: ', fetchGroupMembers);
    // changePageCount(group_members.length);
    state.pageCount = group_members[Object.keys(group_members)[0]].length;
  };
  if (
    state.mode === 'group' &&
    state.selected &&
    state.selected.cn &&
    loading === false
  ) {
    // console.log('handleFetchGroupMembers: ', handleFetchGroupMembers);
    console.log('state.selected.dn: ', state.selected.dn);
    handleFetch_GroupMembers(state.selected);
    console.log('state: ', state);
    console.log('loading: ', loading);
  }

  const handleFetchPersonsGroups = (
    selected: Person,
    dns: string[] = [],
    _currentPage: number = 0
  ): void => {
    const { groups } = selected;

    if (groups && groups.length > 0) {
      setLoading(true);
      fetchPersonsGroups(selected, [], dns, state.ous, _currentPage).then(
        result => {
          dispatchList({
            type: 'LIST/LOAD_LIST',
            list: result,
          });
          setLoading(false);
        }
      );
    }
  };

  useEffect(() => {
    const { mode, selected } = state;
    if (!viewOnly && mode === 'group') {
      // if (selected.cn) handleFetchGroupMembers(selected, groups);
    } else {
      if (selected.cn) handleFetchPersonsGroups(selected, groups);
    }

    // Update the document title using the browser API
    if (
      !groups ||
      typeof groups !== 'object' ||
      groups.length < 0 ||
      groups.filter((str: string) => str.includes('_GRPMGMT_')) < 1
    ) {
      if (window) window.location.href = '/';
    } else {
      if (!state.ous || state.ous.length === 0) {
        setOus();
      }

      if (!state.adminMinGroups || state.adminMinGroups.length === 0) {
        getAdminMinGroups();
      }

      // Once a selection is made, populate the list and update suggestions.
      setApiUrl();
    }
  }, [state.selected]);

  // const handleToggleItem = (item: Group | Person) => {
  //   if (item.action && item.action === 'new') {
  //     dispatchList({ type: 'LIST/DELETE_ITEM', item });
  //   } else {
  //     dispatchList({ type: 'LIST/TOGGLE_ITEM_STATUS', item });
  //   }
  // };

  const handleAddToList = (item: Group | Person) =>
    dispatchList({ type: 'LIST/ADD_ITEM', item });

  // Convenience method.
  const inverseMode = (): Mode => {
    if (state.mode === 'person') {
      return 'group';
    } else {
      return 'person';
    }
  };

  let cnEntries = [];
  if (state.selected.members || state.selected.groups) {
    cnEntries = state.selected.members
      ? state.selected.members
      : state.selected.groups;
  }

  switch (state.view) {
    case 'management':
      return (
        <div css={CONTAINER_STYLING}>
          <ManagementView
            mode={viewOnly ? 'person' : state.mode}
            selected={state.selected}
            changeView={changeView}
            list={list}
            loading={loading}
            viewOnly={viewOnly && viewOnly === true ? true : false}
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
                cnArray={cnEntries}
                currentlist={list}
              />
            }
            // editableList={
            //   <EditableList
            //     mode={viewOnly ? 'person' : state.mode}
            //     items={list}
            //     loading={loading}
            //     handleChange={handleToggleItem}
            //     handleClick={handleClickListItem}
            //     dns={groups}
            //     currentPage={state.currentPage}
            //     pageCount={state.pageCount}
            //     pageSize={state.pageSize}
            //     changePage={changePage}
            //     viewOnly={viewOnly && viewOnly === true ? true : false}
            //   />
            // }
            resetAll={resetAll}
          />
        </div>
      );

    case 'review':
      return (
        <div css={CONTAINER_STYLING}>
          <ReviewChangesView
            mode={viewOnly ? 'person' : state.mode}
            selected={state.selected}
            changeView={changeView}
            resetAll={resetAll}
            items={list}
            dns={groups}
            getAdminMinGroups={getAdminMinGroups}
          />
        </div>
      );

    case 'confirmation':
      return (
        <div css={CONFIRMATION_CONTAINER_STYLING}>
          <ReviewConfirmationView
            mode={viewOnly ? 'person' : state.mode}
            selected={state.selected}
            changeView={changeView}
            resetAll={resetAll}
            items={list}
          />
        </div>
      );

    default:
      return (
        <div css={CONTAINER_STYLING}>
          <InitialView
            mode={viewOnly && viewOnly === true ? 'person' : state.mode}
            changeMode={changeMode}
            adminMinGroups={state.adminMinGroups}
            handleAdminGroupClick={handleAdminListItemClick}
            viewOnly={viewOnly && viewOnly === true ? true : false}
            searchComponent={
              <SearchComponent
                mode={viewOnly ? 'person' : state.mode}
                view="initial"
                handleFetch={
                  viewOnly && viewOnly === true
                    ? fetchPersonSearch
                    : state.mode === 'group'
                    ? fetchGroupSearch
                    : fetchPersonSearch
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
