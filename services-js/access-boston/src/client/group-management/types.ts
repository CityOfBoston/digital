export type View = 'initial' | 'management' | 'review' | 'confirmation';
export type Mode = 'person' | 'group';
export type ItemStatus = 'current' | 'add' | 'remove';
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

  // A group is available if the user is an app owner and may add/remove users;
  // a person is available if they are not set as “inactive”.
  isAvailable?: boolean;
}

export interface ChunkedArray {
  chunkedArray: Array<{}>;
}

export interface Group extends CommonAttributes {
  members: string[];
  // chunkedMembers?: Array<ChunkedArray>;
  chunked?: any;
}

export interface Person extends CommonAttributes {
  groups: string[];
  // chunkedGroups?: Array<ChunkedArray>;
  chunked?: any;
  givenName: string;
  sn: string;
  mail: string;
}
