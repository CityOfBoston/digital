/* eslint no-console: 0 */
// todo

import { Group, Person } from '../types';

export type ActionTypes =
  | 'LIST/LOAD_LIST'
  | 'LIST/CLEAR_LIST'
  | 'LIST/ADD_ITEM'
  | 'LIST/REMOVE_ITEM'
  | 'LIST/TOGGLE_ITEM_STATUS'
  | 'LIST/RETURN_ITEM'
  | 'LIST/DELETE_ITEM';

interface Action {
  type: ActionTypes;
  list?: Array<Group | Person>;
  item?: Group | Person;
  cn?: string;
}

export const reducer = (list, action: Partial<Action>) => {
  //@ts-ignore todo
  // console.info(action.type);

  switch (action.type) {
    case 'LIST/LOAD_LIST':
      if (action.list) {
        return action.list.map(item => ({
          ...item,
          status: 'current',
        }));
      } else {
        return list;
      }

    case 'LIST/CLEAR_LIST':
      return [];

    case 'LIST/ADD_ITEM':
      return [
        {
          ...action.item,
          status: 'add',
        },
        ...list,
      ];

    case 'LIST/DELETE_ITEM':
      return list.filter(item => {
        const action_item: any = action.item;
        if (item.cn !== action_item.cn) {
          return { ...item };
        }
      });

    case 'LIST/REMOVE_ITEM':
      return list.map(item => {
        if (item.cn === action.cn) {
          return { ...item, status: 'remove' };
        } else {
          return item;
        }
      });

    case 'LIST/TOGGLE_ITEM_STATUS':
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

    case 'LIST/RETURN_ITEM':
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
