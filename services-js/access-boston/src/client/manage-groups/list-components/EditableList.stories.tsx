import React, { useEffect, useReducer } from 'react';

import { storiesOf } from '@storybook/react';

import { Group, Person } from '../types';

import { reducer } from '../state/list';

import {
  fetchPersonsGroups,
  fetchGroupMembers,
} from '../fixtures/fetch-list-data';

import EditableList from './EditableList';

export function EditableListWrapper(props) {
  const [list, dispatch] = useReducer(reducer, []);

  const toggleItem = (item: Group | Person) => {
    dispatch({ type: 'TOGGLE_ITEM_STATUS', cn: item.cn });
  };

  useEffect(() => {
    if (props.mode === 'person') {
      fetchGroupMembers(['Laguna Loire', '000296', 'Ignis Scientia']).then(
        people => dispatch({ type: 'LOAD_LIST', list: people })
      );
    } else if (props.mode === 'group') {
      fetchPersonsGroups(
        ['ANML02_LostFound', 'BPD_Districts', 'BPD_Administrative'],
        []
      ).then(groups => dispatch({ type: 'LOAD_LIST', list: groups }));
    }
  }, []);

  return <EditableList {...props} items={list} handleChange={toggleItem} />;
}

storiesOf('ManageGroupsPage/ListComponents/EditableList', module)
  .add('editable group view', () => <EditableListWrapper mode="group" />)
  .add('editable person view', () => <EditableListWrapper mode="person" />);
