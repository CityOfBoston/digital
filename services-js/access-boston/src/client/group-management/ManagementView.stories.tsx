import React, { useEffect, useReducer } from 'react';

import { storiesOf } from '@storybook/react';

import { reducer } from './state/list';

import {
  fetchGroupSearchRemaining,
  fetchPersonsGroups,
} from './fixtures/mock-fetch-group-data';
import {
  fetchGroupMembers,
  fetchPersonSearchRemaining,
} from './fixtures/mock-fetch-person-data';

import { toGroup, toPerson } from './state/data-helpers';

import { Group, Person } from './types';

import allGroups from './fixtures/groups.json';
import allPeople from './fixtures/people.json';

import ManagementView from './ManagementView';
import SearchComponent from './search-component/SearchComponent';
import EditableList from './list-components/EditableList';

const groups = allGroups.map(group => toGroup(group));
const people = allPeople.map(person => toPerson(person));

export function Wrapper(props) {
  const [list, dispatch] = useReducer(reducer, []);

  const { loading, mode, selected } = props;

  const searchMode = mode === 'person' ? 'group' : 'person';

  const toggleItem = (item: Group | Person) => {
    dispatch({ type: 'LIST/TOGGLE_ITEM_STATUS', cn: item.cn });
  };

  const loadList = selected => {
    if (searchMode === 'group') {
      fetchPersonsGroups(selected, []).then(groups =>
        dispatch({ type: 'LIST/LOAD_LIST', list: groups })
      );
    } else if (searchMode === 'person') {
      fetchGroupMembers(selected).then(people =>
        dispatch({ type: 'LIST/LOAD_LIST', list: people })
      );
    }
  };

  useEffect(() => {
    loadList(selected);
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ManagementView
        mode={mode}
        selected={selected}
        changeView={() => {}}
        list={list}
        loading={loading}
        searchComponent={
          <SearchComponent
            mode={searchMode}
            view="management"
            handleFetch={
              searchMode === 'group'
                ? fetchGroupSearchRemaining
                : fetchPersonSearchRemaining
            }
            handleSelectClick={() => {}}
            selectedItem={selected}
            dns={[]}
          />
        }
        editableList={
          <EditableList
            {...props}
            items={list}
            loading={loading}
            handleChange={toggleItem}
          />
        }
        resetAll={() => {}}
      />
    </div>
  );
}

storiesOf('GroupManagementPage/ManagementView', module)
  .add('person view', () => <Wrapper mode="person" selected={people[1]} />)
  .add('group view', () => <Wrapper mode="group" selected={groups[2]} />)
  .add('loading view', () => (
    <Wrapper mode="group" selected={groups[2]} loading={true} />
  ));
