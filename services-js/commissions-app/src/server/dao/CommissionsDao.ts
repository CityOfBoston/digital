import { ConnectionPool, IResult, Int as IntType } from 'mssql';
import DataLoader from 'dataloader';

import {
  BoardsEntityAll,
  DepartmentsEntityAll,
  AuthorityTypesEntityAll,
  vw_BoardsWithMembersEntityAll,
  PolicyTypesEntityAll,
} from './CommissionsDb.d';

export type DbBoard = BoardsEntityAll & {
  // Added by the BQARD_SQL below
  ActiveCount: number;
};
export type DbDepartment = DepartmentsEntityAll;
export type DbAuthority = AuthorityTypesEntityAll;
export type DbMember = vw_BoardsWithMembersEntityAll;
export type DbPolicyType = PolicyTypesEntityAll;

/**
 * SQL statement to do a custom join that pulls in the number of "Active"
 * membership assignments. Done so we can get counts of open seats by comparing
 * with the "Seats" column.
 *
 * We do this with a join for efficiency rather than pulling in all of the
 * members and doing a JS-side filter.
 */
const BOARD_SQL = `
  SELECT * FROM dbo.Boards JOIN
    (SELECT Assignments.BoardId, COUNT(Assignments.PersonId) as ActiveCount
      FROM Assignments
      WHERE Assignments.StatusId = 101
      GROUP BY Assignments.BoardId) AS tmp
    ON Boards.BoardID = tmp.BoardId WHERE IsLive=1`;

export default class CommissionsDao {
  protected pool: ConnectionPool;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  /**
   * Named "fetchBoards" because it accesses the "Boards" table.
   */
  async fetchBoards(): Promise<Array<DbBoard>> {
    const resp: IResult<DbBoard> = await this.pool.request().query(BOARD_SQL);

    return resp.recordset;
  }

  async fetchBoard(boardId: number): Promise<DbBoard | null> {
    const resp: IResult<DbBoard> = await this.pool
      .request()
      .input('board_id', IntType, boardId)
      .query(`${BOARD_SQL} AND Boards.BoardID=@board_id`);

    return resp.recordset[0] || null;
  }

  async fetchBoardMembers(boardId: number): Promise<DbMember[]> {
    const resp: IResult<DbMember> = await this.pool
      .request()
      .input('board_id', IntType, boardId)
      .query('SELECT * FROM vw_BoardsWithMembers WHERE BoardID=@board_id');

    return resp.recordset;
  }

  async fetchPolicyTypes(): Promise<DbPolicyType[]> {
    const resp: IResult<DbPolicyType> = await this.pool
      .request()
      .query(`SELECT * FROM PolicyTypes`);

    return resp.recordset;
  }

  protected policyTypeLoader = new DataLoader(async (ids: number[]) => {
    const policyTypes = await this.fetchPolicyTypes();
    return ids.map(
      id => policyTypes.find(({ PolicyTypeId }) => PolicyTypeId === id) || null
    );
  });

  async fetchPolicyType(id: number): Promise<DbPolicyType | null> {
    return this.policyTypeLoader.load(id);
  }

  protected async fetchDepartments(ids: number[]) {
    const resp: IResult<DbDepartment> = await this.pool
      .request()
      .query(
        `SELECT * FROM Departments WHERE DepartmentId IN (${ids.join(', ')})`
      );

    return ids.map(
      id =>
        resp.recordset.find(({ DepartmentId }) => DepartmentId === id) || null
    );
  }

  protected departmentLoader = new DataLoader((ids: number[]) =>
    this.fetchDepartments(ids)
  );

  fetchDepartment(departmentId: number): Promise<DbDepartment | null> {
    return this.departmentLoader.load(departmentId);
  }

  protected async fetchAuthorities(ids: number[]) {
    const resp: IResult<DbAuthority> = await this.pool
      .request()
      .query(
        `SELECT * FROM AuthorityTypes WHERE AuthorityId IN (${ids.join(', ')})`
      );

    return ids.map(
      id => resp.recordset.find(({ AuthorityId }) => AuthorityId === id) || null
    );
  }

  protected authorityLoader = new DataLoader((ids: number[]) =>
    this.fetchAuthorities(ids)
  );

  fetchAuthority(authorityId: number): Promise<DbAuthority | null> {
    return this.authorityLoader.load(authorityId);
  }
}
