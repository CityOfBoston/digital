import React, { useReducer } from 'react';

import { storiesOf } from '@storybook/react';

import { reducer, initialState } from './state/app';

import { fetchPersonSearch } from './fixtures/mock-fetch-person-data';
import { fetchGroupSearch } from './fixtures/mock-fetch-group-data';

import InitialView from './InitialView';
import SearchComponent from './search-component/SearchComponent';

function Wrapper() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toggleMode = () => {
    if (state.mode === 'person') {
      dispatch({ type: 'APP/CHANGE_MODE', mode: 'group' });
    } else {
      dispatch({ type: 'APP/CHANGE_MODE', mode: 'person' });
    }
  };

  return (
    <InitialView
      adminMinGroups={[]}
      handleAdminGroupClick={() => {}}
      mode={state.mode}
      changeMode={toggleMode}
      searchComponent={
        <SearchComponent
          mode={state.mode}
          view="initial"
          handleFetch={
            state.mode === 'group' ? fetchGroupSearch : fetchPersonSearch
          }
          handleSelectClick={() => {}}
          dns={[]}
          currentPage={0}
          pageSize={1}
          changePageCount={() => {}}
        />
      }
      pageSize={150}
      dispatchList={() => {}}
      changePageCount={() => {}}
    />
  );
}

storiesOf('GroupManagementPage/InitialView', module).add('default', () => (
  <Wrapper />
));
