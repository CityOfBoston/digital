import { ConnectionPool, IResult, Int as IntType } from 'mssql';
import DataLoader from 'dataloader';

import {
  BoardsEntityAll,
  DepartmentsEntityAll,
  AuthorityTypesEntityAll,
  vw_BoardsWithMembersEntityAll,
} from './CommissionsDb.d';

export type DbBoard = BoardsEntityAll;
export type DbDepartment = DepartmentsEntityAll;
export type DbAuthority = AuthorityTypesEntityAll;
export type DbMember = vw_BoardsWithMembersEntityAll;

export default class CommissionsDao {
  protected pool: ConnectionPool;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  /**
   * Named "fetchBoards" because it accesses the "Boards" table.
   */
  async fetchBoards(): Promise<Array<DbBoard>> {
    const resp: IResult<DbBoard> = await this.pool
      .request()
      .query('SELECT * FROM Boards WHERE IsLive=1');

    return resp.recordset;
  }

  async fetchBoard(boardId: number): Promise<DbBoard | null> {
    const resp: IResult<DbBoard> = await this.pool
      .request()
      .input('board_id', IntType, boardId)
      .query('SELECT * FROM Boards WHERE BoardID=@board_id AND IsLive=1');

    return resp.recordset[0] || null;
  }

  async fetchBoardMembers(boardId: number): Promise<DbMember[]> {
    const resp: IResult<DbMember> = await this.pool
      .request()
      .input('board_id', IntType, boardId)
      .query('SELECT * FROM vw_BoardsWithMembers WHERE BoardID=@board_id');

    return resp.recordset;
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
