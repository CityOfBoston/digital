export type Question =
  | 'forSelf'
  | 'howRelated'
  | 'bornInBoston'
  | 'parentsLivedInBoston'
  | 'nameOnRecord'
  | 'dateOfBirth'
  | 'parentsMarried'
  | 'parentsNames'
  | 'endFlow';

export type Relation =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'familyMember'
  | 'friend'
  | 'client'
  | '';

export type YesNoUnknownAnswer = 'yes' | 'no' | 'unknown' | '';

export interface RequestInformation {
  forSelf: boolean | null;
  howRelated?: Relation;
  bornInBoston: YesNoUnknownAnswer;
  parentsLivedInBoston?: YesNoUnknownAnswer;
  firstName: string;
  lastName: string;
  altSpelling?: string;
  dateOfBirth: string; // todo: store as Date?
  parentsMarried: YesNoUnknownAnswer;
  parent1FirstName: string;
  parent1LastName?: string;
  parent2FirstName?: string;
  parent2LastName?: string;
}
