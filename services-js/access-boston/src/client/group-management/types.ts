export type View = 'initial' | 'management' | 'review' | 'confirmation';
export type Mode = 'person' | 'group';
export type ItemStatus = 'current' | 'add' | 'remove' | 'new';
export type Action = '' | 'new';
export type ShowLabel = true | false;
export type CurrentPage = number;
export type PageCount = number;
export type PagedResults = Array<Array<{}>>;

export const pageSize = 50;
export const startPage = 0;
export const currentPage = startPage;
export const pageCount = 1;

export interface CommonAttributes {
  dn: string;
  cn: string;
  displayName: string;

  status: ItemStatus;
  action: Action;

  // A group is available if the user is an app owner and may add/remove users;
  // a person is available if they are not set as “inactive”.
  isAvailable?: boolean;
}

// export interface ChunkedArray {
//   chunkedArray: any;
// }

export interface Group extends CommonAttributes {
  members: string[];
  chunked?: any;
}

export interface Person extends CommonAttributes {
  groups: string[];
  chunked?: any;
  givenName: string;
  sn: string;
  mail: string;
}
