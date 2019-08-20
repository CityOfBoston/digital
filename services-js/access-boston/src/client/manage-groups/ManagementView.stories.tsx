import React, { useEffect, useReducer } from 'react';

import { storiesOf } from '@storybook/react';

import { reducer } from './state/list';

import {
  fetchRemainingGroups,
  fetchRemainingPeople,
} from './fixtures/fetch-search-results';

import {
  fetchGroupMembers,
  fetchPersonsGroups,
} from './fixtures/fetch-list-data';

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

  const searchMode = props.mode === 'person' ? 'group' : 'person';

  const toggleItem = (item: Group | Person) => {
    dispatch({ type: 'TOGGLE_ITEM_STATUS', cn: item.cn });
  };

  useEffect(() => {
    if (searchMode === 'group') {
      fetchPersonsGroups(props.selected.groups, []).then(groups =>
        dispatch({ type: 'LOAD_LIST', list: groups })
      );
    } else if (searchMode === 'person') {
      fetchGroupMembers(props.selected.members).then(people =>
        dispatch({ type: 'LOAD_LIST', list: people })
      );
    }
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ManagementView
        mode={props.mode}
        selected={props.selected}
        changeView={() => {}}
        list={list}
        searchComponent={
          <SearchComponent
            mode={searchMode}
            view="management"
            handleFetch={
              searchMode === 'group'
                ? fetchRemainingGroups
                : fetchRemainingPeople
            }
            handleSelectClick={() => {}}
            selectedItem={props.selected}
          />
        }
        editableList={
          <EditableList {...props} items={list} handleChange={toggleItem} />
        }
      />
    </div>
  );
}

storiesOf('ManageGroupsPage/ManagementView', module)
  .add('person view', () => <Wrapper mode="person" selected={people[1]} />)
  .add('group view', () => <Wrapper mode="group" selected={groups[2]} />);
