
/*
* This file was generated by a tool.
* Rerun sql-ts to regenerate this file.
*/
export interface sysdiagramsEntity {
  name?: string 
  principal_id?: number 
  diagram_id: number 
  version?: number | null 
  definition?: string | null 
}
export interface __MigrationHistoryEntity {
  MigrationId?: string 
  ContextKey?: string 
  Model?: string 
  ProductVersion?: string 
}
export interface AspNetRolesEntity {
  Id?: string 
  Name?: string 
}
export interface AspNetUserClaimsEntity {
  Id?: number 
  UserId?: string 
  ClaimType?: string | null 
  ClaimValue?: string | null 
}
export interface AspNetUserLoginsEntity {
  LoginProvider?: string 
  ProviderKey?: string 
  UserId?: string 
}
export interface AspNetUserRolesEntity {
  UserId?: string 
  RoleId?: string 
}
export interface AspNetUsersEntity {
  Id?: string 
  Email?: string | null 
  EmailConfirmed?: boolean 
  PasswordHash?: string | null 
  SecurityStamp?: string | null 
  PhoneNumber?: string | null 
  PhoneNumberConfirmed?: boolean 
  TwoFactorEnabled?: boolean 
  LockoutEndDateUtc?: Date | null 
  LockoutEnabled?: boolean 
  AccessFailedCount?: number 
  UserName?: string 
}
export interface PolicyTypesEntity {
  PolicyTypeId: number 
  PolicyType?: string 
  AddBy?: string 
  AddDtTm?: Date 
  ModBy?: string | null 
  ModDtTm?: Date | null 
}
export interface BoardsEntity {
  BoardID: number 
  PolicyTypeId?: number | null 
  BoardName?: string | null 
  Contact?: string | null 
  Legislation?: string | null 
  Seats: number 
  Alternates: number 
  CouncilCofirm?: boolean | null 
  Residency?: boolean | null 
  Term?: string | null 
  Qualification?: string | null 
  Schedule?: string | null 
  Location?: string | null 
  Stipend: number 
  ClerkBoard: boolean 
  IsLive?: boolean 
  Description?: string | null 
  Email?: string | null 
  DepartmentId?: number | null 
  AuthorityId?: number | null 
  Address1?: string | null 
  Address2?: string | null 
  City?: string | null 
  Zipcode?: string | null 
  Phone?: string | null 
  FileName?: string | null 
  FilePath?: string | null 
  Quorum: number | null 
  LinkPath?: string | null 
  AddBy?: string 
  AddDtTm: Date 
  ModBy?: string | null 
  ModDtTm?: Date | null 
}
export interface DepartmentsEntity {
  DepartmentId: number 
  DepartmentName?: string | null 
  Manager?: string | null 
  Title?: string | null 
  Phone?: string | null 
  Email?: string | null 
  PSDeptId?: number | null 
  ApptDtTm?: Date | null 
  ExpireDtTm?: Date | null 
  LinkPath?: string | null 
  AddBy?: string | null 
  AddDtTm: Date 
  ModBy?: string | null 
  ModDtTm?: Date | null 
}
export interface View_1Entity {
  BoardID?: number 
  BoardName?: string | null 
  Seats?: number 
  SeatCount?: number | null 
  OpenSeats?: number | null 
  test?: string | null 
}
export interface BoardModifyEntity {
  BoardModifyId: number 
  BoardId?: number 
  PolicyTypeId?: number | null 
  BoardName?: string | null 
  Contact?: string | null 
  Legislation?: string | null 
  Seats: number 
  Alternates: number 
  CouncilCofirm?: boolean | null 
  Residency?: boolean | null 
  Term?: string | null 
  Qualification?: string | null 
  Schedule?: string | null 
  Location?: string | null 
  Stipend: number 
  ClerkBoard: boolean 
  IsLive?: boolean 
  Description?: string | null 
  Email?: string | null 
  DepartmentId?: number | null 
  AuthorityId?: number | null 
  Address1?: string | null 
  Address2?: string | null 
  City?: string | null 
  Zipcode?: string | null 
  Phone?: string | null 
  FileName?: string | null 
  FilePath?: string | null 
  Quorum: number | null 
  LinkPath?: string | null 
  Comments?: string | null 
  AddBy?: string 
  AddDtTm: Date 
  ModBy?: string | null 
  ModDtTm?: Date | null 
}
export interface AppliedForEntity {
  AppliedForId: number 
  BoardId?: number 
  ApplicantId?: number 
}
export interface ApplicantsEntity {
  ApplicantId: number 
  Salutation?: string | null 
  FirstName?: string 
  LastName?: string 
  MiddleName?: string | null 
  Address1?: string 
  Address2?: string | null 
  City?: string 
  State?: string 
  ZipCode?: string 
  PriPhone?: string | null 
  Fax?: string | null 
  Email?: string 
  DegreeType?: string | null 
  DegreeAttained?: string | null 
  Institution?: string | null 
  Education?: string | null 
  // CoverLetter?: string | null 
  // Resume?: string | null 
  // CoverLetterImg?: any | null 
  // ResumeImg?: any | null 
  Comments?: string | null 
  Ethnicity?: string | null 
  AddDtTm: Date 
}
export interface AssignmentsEntity {
  AssignmentId: number 
  SeatNumber?: number | null 
  AppointDtTm?: Date | null 
  ExpireDtTm?: Date | null 
  SwornDtTm?: Date | null 
  Docket?: string | null 
  PersonId?: number | null 
  BoardId?: number | null 
  StatusId?: number | null 
  Certificate: boolean 
  TitleId?: number | null 
  Appointed: boolean 
  DeleteReq: boolean 
  AddBy?: string 
  AddDtTm: Date 
  ModBy?: string | null 
  ModDtTm?: Date | null 
  DeleteDtTm?: Date | null 
}
export interface AuthorityTypesEntity {
  AuthorityId: number 
  AuthorityType?: string | null 
  AddBy?: string 
  AddDtTm: Date 
  ModBy?: string | null 
  ModDtTm?: Date | null 
}
export interface PeopleEntity {
  PersonId: number 
  FirstName?: string | null 
  LastName?: string | null 
  ProfessionalTitle?: string | null 
  Address1?: string | null 
  Address2?: string | null 
  City?: string | null 
  State?: string | null 
  ZipCode?: string | null 
  PriPhone?: string | null 
  Fax?: string | null 
  Email?: string | null 
  Website?: string | null 
  Qualification?: string | null 
  Status?: string | null 
  Extension?: string | null 
  MiddleName?: string | null 
  GenderTypeId: number 
  RaceTypeId: number 
  AddBy?: string 
  AddDtTm: Date 
  ModBy?: string | null 
  ModDtTm?: Date | null 
}
export interface GenderTypesEntity {
  GenderTypeId: number 
  GenderType?: string 
}
export interface RaceTypesEntity {
  RaceTypeId: number 
  RaceType?: string 
  AddBy?: string 
  AddDtTm?: Date 
  ModBy?: string | null 
  ModDtTm?: Date | null 
}
export interface TitleTypesEntity {
  TitleId: number 
  TitleName?: string 
  AddBy?: string 
  AddDtTm?: Date 
  ModBy?: string | null 
  ModDtTm?: Date | null 
}
export interface StatusTypesEntity {
  StatusId: number 
  StatusName?: string 
  AddBy?: string 
  AddDtTm: Date 
  ModBy?: string | null 
  ModDtTm?: Date | null 
}
export interface vw_BoardsWithMembersEntity {
  BoardID?: number 
  AssignmentId?: number 
  PersonId?: number 
  StatusId?: number 
  BoardName?: string | null 
  AppointDtTm?: Date | null 
  ExpireDtTm?: Date | null 
  Docket?: string | null 
  FirstName?: string | null 
  LastName?: string | null 
  StatusName?: string 
  Stipend?: number 
}


export type sysdiagramsEntityAll = Required<sysdiagramsEntity>;
export type __MigrationHistoryEntityAll = Required<__MigrationHistoryEntity>;
export type AspNetRolesEntityAll = Required<AspNetRolesEntity>;
export type AspNetUserClaimsEntityAll = Required<AspNetUserClaimsEntity>;
export type AspNetUserLoginsEntityAll = Required<AspNetUserLoginsEntity>;
export type AspNetUserRolesEntityAll = Required<AspNetUserRolesEntity>;
export type AspNetUsersEntityAll = Required<AspNetUsersEntity>;
export type PolicyTypesEntityAll = Required<PolicyTypesEntity>;
export type BoardsEntityAll = Required<BoardsEntity>;
export type DepartmentsEntityAll = Required<DepartmentsEntity>;
export type View_1EntityAll = Required<View_1Entity>;
export type BoardModifyEntityAll = Required<BoardModifyEntity>;
export type AppliedForEntityAll = Required<AppliedForEntity>;
export type ApplicantsEntityAll = Required<ApplicantsEntity>;
export type AssignmentsEntityAll = Required<AssignmentsEntity>;
export type AuthorityTypesEntityAll = Required<AuthorityTypesEntity>;
export type PeopleEntityAll = Required<PeopleEntity>;
export type GenderTypesEntityAll = Required<GenderTypesEntity>;
export type RaceTypesEntityAll = Required<RaceTypesEntity>;
export type TitleTypesEntityAll = Required<TitleTypesEntity>;
export type StatusTypesEntityAll = Required<StatusTypesEntity>;
export type vw_BoardsWithMembersEntityAll = Required<vw_BoardsWithMembersEntity>;
