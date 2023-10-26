/** @jsx jsx */

import { jsx } from '@emotion/core';

import { useEffect, useReducer, useState } from 'react';
import { Group, Mode, Person, View, pageCount } from './types';

import { reducer as stateReducer, initialState } from './state/app';
import { reducer as listReducer } from './state/list';

import InitialView from './InitialView';
import ManagementView from './ManagementView';
import ReviewChangesView from './ReviewChangesView';
import ReviewConfirmationView from './ReviewConfirmationView';

// import EditableList from './list-components/EditableList';
import SearchComponent from './search-component/SearchComponent';
import EditView from './list-components/edit';

import {
  fetchGroupSearch,
  fetchGroupSearchRemaining,
  // fetchPersonsGroups,
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
// import { toPerson } from './state/data-helpers';

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
  // const [selected.chunked, setChunked] = useState<Array<string | object>>([{}]);
  const viewOnly =
    groups.includes('SG_AB_GRPMGMT_SERVICEDESKVIEWONLY') &&
    groups.filter((str: string | string[]) => str.includes('_GRPMGMT_'))
      .length === 1;

  const changeView = (newView: View): void =>
    dispatchState({ type: 'APP/CHANGE_VIEW', view: newView });

  const changeMode = (newMode: Mode): void =>
    dispatchState({ type: 'APP/CHANGE_MODE', mode: newMode });

  const changePageCount = (pageCount: number): void => {
    dispatchState({ type: 'APP/CHANGE_PAGECOUNT', pageCount });
  };

  const handleClickListItem = (item: Group | Person): void => {
    changeSelected(item);
    changeMode(state.mode === 'group' ? 'person' : 'group');
  };

  const handleToggleItem = (item: Group | Person) => {
    console.log('handleToggleItem: ', item);
    if (item.action && item.action === 'new') {
      dispatchList({ type: 'LIST/DELETE_ITEM', item });
    } else {
      dispatchList({ type: 'LIST/TOGGLE_ITEM_STATUS', item });
    }
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

  const handleFetchPersonsGroups = (
    selected: Person,
    _dns: string[] = [],
    _currentPage: number = 0
  ): void => {
    const { groups } = selected;
    setLoading(true);
    // console.log(
    //   'handleFetchPersonsGroups({selected: Person}, ... ) ',
    //   selected
    // );
    // console.log('state: ', state);
    // console.log('handleFetchPersonsGroups(groups, ... ) ', groups);
    // console.log('handleFetchPersonsGroups(selected, ... ) ', selected);
    let newChunk: Array<Group> = [];

    if (groups.length > 0 && typeof groups[0] === 'string') {
      newChunk = groups.map(entry => {
        return {
          cn: entry,
          dn: entry,
          displayName: entry,
          member: [],
          uniquemember: [],
          groupmember: [],
          members: [],
          status: 'current',
          action: '',
        };
      });
    }

    if (newChunk.length > 0 && typeof newChunk[0] !== 'undefined') {
      state.selected.groups = chunkArray(newChunk, pageSize);
      // this.setState({
      //   chunked: newChunk,
      // });
      // setChunked(newChunk);
      // dispatchState()
      // dispatchState({
      //   type: 'APP/SET_SELECTED',
      //   selected: { ...state.selected, chuncked: newChunk },
      //   groupmembers: state.selected.groupmembers,
      // });
      console.log('newChunk state: ', state);
      // setLoading(false);
    }

    // fetchPersonsGroups(selected).then(result => {
    //   console.log('result: ', result);
    //   dispatchList({
    //     type: 'LIST/LOAD_LIST',
    //     list: result,
    //   });
    //   setLoading(false);
    // });

    // if (groups && groups.length > 0) {
    //   setLoading(true);
    //   fetchPersonsGroups(selected, _dns, state.ous, _currentPage, []).then(
    //     result => {
    //       dispatchList({
    //         type: 'LIST/LOAD_LIST',
    //         list: result,
    //       });
    //       setLoading(false);
    //     }
    //   );
    // }
  };

  const changeSelected = async (
    selectedItem: Group | Person
  ): Promise<void> => {
    const { mode } = state;
    let members: any = [];

    if (mode === 'group') {
      members = await fetchGroupMembers(selectedItem.dn, state.pageSize);
      changePageCount(members.length);
      // console.log(`pageCount: `, members.length);
      // console.log('state: ', state);
    } else {
      // code
      members = [
        [
          {
            dn: '',
            cn: '',
            displayName: '',
            members: [],
            status: 'current',
            action: '',
          },
        ],
      ];
    }

    dispatchState({
      type: 'APP/SET_SELECTED',
      selected: selectedItem,
      groupmembers: members,
    });
  };

  const resetAll = (): void => {
    dispatchState({ type: 'APP/RESET_STATE' });
    dispatchList({ type: 'LIST/CLEAR_LIST' });
  };

  const changePage = (currentPage: number): void => {
    dispatchState({ type: 'APP/CHANGE_PAGE', currentPage });
    // const { mode, selected } = state;
    // if (mode === 'group') {
    //   if (
    //     selected.cn &&
    //     selected.chunked[currentPage] &&
    //     selected.chunked[currentPage].length > 0
    //   ) {
    //     // handleFetchGroupMembers(selected, groups, currentPage);
    //     handleFetch_GroupMembers(selected);
    //   }
    // } else {
    //   if (
    //     selected.cn &&
    //     selected.chunked[currentPage] &&
    //     selected.chunked[currentPage].length > 0
    //   )
    //     handleFetchPersonsGroups(selected, groups, currentPage);
    // }
  };

  const handleInitialSelection = (selectedItem: any): void => {
    changeSelected(selectedItem);
    changeView('management');
  };

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
      // console.log('convertOUsToContainers result: ', result);
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

  useEffect(() => {
    const { mode, selected } = state;
    if (!viewOnly && mode === 'group') {
      // if (selected.cn) handleFetchGroupMembers(selected, groups);
      // NOTE: ^ Not needed anymore, handled by improved group-member's fetch
      if (!loading) console.log('useEffect - GROUP', mode);
    } else {
      if (!loading) console.log('useEffect - PERSON', mode);
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
  const items =
    state.mode === 'person'
      ? state.selected.groups
      : state.selected.groupmember;
  // const items = state.selected.groupmember;
  // console.log('state: ', state);

  switch (state.view) {
    case 'management':
      // console.log(`state.view (inside swith): ${state.view}`);
      // console.log(`state.selected: `, state.selected);
      // console.log(`state.selected.chunked: `, state.selected.chunked);
      // console.log(`state.selected.groupmember: `, state.selected.groupmember);
      if (
        // list &&
        // typeof list.length === 'number' &&
        // list.length > 0 &&
        state.mode === 'person' &&
        loading === false
      ) {
        // console.log('list: ', list);
        // console.log('selected: ', state.selected);
        console.log('!loading > state: ', state);
        console.log(
          'groupmember | groups: ',
          state.selected.groupmember,
          state.selected.groups,
          '----\n'
        );
      }

      // if (
      //   // state.selected.groupmember &&
      //   // typeof state.selected.groupmember.length === 'number' &&
      //   // state.selected.groupmember.length > 0 &&
      //   loading === false
      // ) {
      //   // console.log('groupmember: ', state.selected.groupmember);
      //   console.log('!loading > state: ', state);
      // }
      // const editViewItems =
      //   state.mode === 'person' ? state.selected.groups : state.selected.groupmember;
      // console.log('state.mode: ', state.mode);
      // console.log('state.selected.groups: ', state.selected.groups);
      // console.log('state.selected.groupmember: ', state.selected.groupmember);

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
            editView={
              <EditView
                mode={viewOnly ? 'person' : state.mode}
                loading={loading}
                pageCount={pageCount}
                pageSize={state.pageSize}
                currentPage={state.currentPage}
                items={items}
                viewOnly={viewOnly && viewOnly === true ? true : false}
                changePage={changePage}
                handleChange={handleToggleItem}
                handleClick={handleClickListItem}
                // handlePrevPage={() => console.log(`handlePrevPage`)}
                // handlePageNumClick={() => console.log(`handlePageNumClick`)}
              />
              // <EditableList
              //   mode={viewOnly ? 'person' : state.mode}
              //   items={list}
              //   loading={loading}
              //   dns={groups}
              //   currentPage={state.currentPage}
              //   pageCount={state.pageCount}
              //   pageSize={state.pageSize}
              //   changePage={changePage}
              //   handleChange={handleToggleItem}
              //   handleClick={handleClickListItem}
              //   viewOnly={viewOnly && viewOnly === true ? true : false}
              // />
            }
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
      // console.log('View: DEFAULT');
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
