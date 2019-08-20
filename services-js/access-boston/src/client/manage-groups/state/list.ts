/* eslint no-console: 0 */
// todo

import { Group, Person } from '../types';

export type ActionTypes =
  | 'LOAD_LIST'
  | 'CLEAR_LIST'
  | 'ADD_ITEM'
  | 'REMOVE_ITEM'
  | 'TOGGLE_ITEM_STATUS'
  | 'RETURN_ITEM';

interface Action {
  type: ActionTypes;
  list?: Array<Group | Person>;
  item?: Group | Person;
  cn?: string;
}

export const reducer = (list, action: Partial<Action>) => {
  //@ts-ignore todo
  console.info(action.type);

  switch (action.type) {
    case 'LOAD_LIST':
      if (action.list) {
        return action.list.map(item => ({
          ...item,
          status: 'current',
        }));
      } else {
        return list;
      }

    case 'CLEAR_LIST':
      return [];

    case 'ADD_ITEM':
      return [
        ...list,
        {
          ...action.item,
          status: 'add',
        },
      ];

    case 'REMOVE_ITEM':
      return list.map(item => {
        if (item.cn === action.cn) {
          return { ...item, status: 'remove' };
        } else {
          return item;
        }
      });

    case 'TOGGLE_ITEM_STATUS':
      return list.map(item => {
        if (action.item && item.cn === action.item.cn) {
          return {
            ...item,
            status: item.status === 'remove' ? 'current' : 'remove',
          };
        } else {
          return item;
        }
      });

    case 'RETURN_ITEM':
      return list.map(item => {
        if (item.cn === action.cn) {
          return { ...item, status: 'current' };
        } else {
          return item;
        }
      });

    default:
      return list;
  }
};
