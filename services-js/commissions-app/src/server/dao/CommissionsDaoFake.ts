import CommissionsDao, { DbBoard } from './CommissionsDao';
import {
  DepartmentsEntityAll,
  AuthorityTypesEntityAll,
  PolicyTypesEntityAll,
  vw_BoardsWithMembersEntityAll,
} from './CommissionsDb';

const AUTHORITIES: AuthorityTypesEntityAll[] = require('../../../fixtures/Authorities.json');
const BOARDS: DbBoard[] = require('../../../fixtures/Boards.json');
const DEPARTMENTS: DepartmentsEntityAll[] = require('../../../fixtures/Departments.json');
const MEMBERS: vw_BoardsWithMembersEntityAll[] = require('../../../fixtures/BoardMembers.json');
const POLICY_TYPES: PolicyTypesEntityAll[] = require('../../../fixtures/PolicyTypes.json');

// Using "Required" makes us duck-compatible with CommissionDao without one
// inheriting from the other or needing to maintain a separate common interface.
// In truth, we don’t actually need the "requirablity" it provides, but it’s
// nice to use the standard library.
export default class CommissionsDaoFake implements Required<CommissionsDao> {
  fetchBoards() {
    return Promise.resolve(BOARDS);
  }

  apply() {
    return Promise.resolve();
  }

  async fetchBoard(id: number) {
    return (
      (await this.fetchBoards()).find(({ BoardID }) => BoardID === id) || null
    );
  }

  fetchAuthority(id: number) {
    return Promise.resolve(
      AUTHORITIES.find(({ AuthorityId }) => AuthorityId === id) || null
    );
  }

  fetchBoardMembers(id: number) {
    return Promise.resolve(MEMBERS.filter(({ BoardID }) => BoardID === id));
  }

  fetchDepartment(id: number) {
    return Promise.resolve(
      DEPARTMENTS.find(({ DepartmentId }) => DepartmentId === id) || null
    );
  }

  fetchPolicyTypes() {
    return Promise.resolve(POLICY_TYPES);
  }

  fetchPolicyType(id: number) {
    return this.fetchPolicyTypes().then(
      policyTypes =>
        policyTypes.find(({ PolicyTypeId }) => PolicyTypeId === id) || null
    );
  }
}
