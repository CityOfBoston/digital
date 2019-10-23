export type View = 'initial' | 'management' | 'review' | 'confirmation';
export type Mode = 'person' | 'group';
export type ItemStatus = 'current' | 'add' | 'remove';
export type ShowLabel = true | false;

export interface CommonAttributes {
  dn: string;
  cn: string;
  displayName: string;

  status: ItemStatus;

  // A group is available if the user is an app owner and may add/remove users;
  // a person is available if they are not set as “inactive”.
  isAvailable?: boolean;
}

export interface Group extends CommonAttributes {
  members: string[];
}

export interface Person extends CommonAttributes {
  groups: string[];
  givenName: string;
  sn: string;
  mail: string;
}
