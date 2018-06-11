/* eslint no-console: 0 */
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import faker from 'faker';
import { ConnectionPool } from 'mssql';

import { createConnectionPool } from '@cityofboston/mssql-common';

import CommissionsDao, { DbMember } from '../src/server/dao/CommissionsDao';

// Used to expose protected members for easier fixture-getting.
class CommissionsDaoInternal extends CommissionsDao {
  constructor(pool: ConnectionPool) {
    super(pool);
  }

  fetchAuthorities(ids: number[]) {
    return super.fetchAuthorities(ids);
  }

  fetchDepartments(ids: number[]) {
    return super.fetchDepartments(ids);
  }
}

dotenv.config();

const FIXTURE_DIR = `fixtures`;

(async function go() {
  const username = process.env.COMMISSIONS_DB_USERNAME;
  const password = process.env.COMMISSIONS_DB_PASSWORD;
  const database = process.env.COMMISSIONS_DB_DATABASE;
  const domain = process.env.COMMISSIONS_DB_DOMAIN;
  const serverName = process.env.COMMISSIONS_DB_SERVER;

  if (!username) {
    throw new Error('Must specify COMMISSIONS_DB_USERNAME');
  }

  if (!password) {
    throw new Error('Must specify COMMISSIONS_DB_PASSWORD');
  }

  if (!database) {
    throw new Error('Must specify COMMISSIONS_DB_DATABASE');
  }

  if (!serverName) {
    throw new Error('Must specify COMMISSIONS_DB_SERVER');
  }

  const pool = await createConnectionPool(
    {
      username,
      password,
      database,
      domain,
      server: serverName,
    },
    err => {
      console.error(err);
      process.exit(-1);
    }
  );

  const fixtureDir = path.resolve(FIXTURE_DIR);

  if (!fs.existsSync(fixtureDir)) {
    fs.mkdirSync(fixtureDir);
  }

  const commissionsDao = new CommissionsDaoInternal(pool);
  const boards = (await commissionsDao.fetchBoards()).slice(0, 10);

  // All data checked in to GitHub needs to have names, emails, phone numbers,
  // and personal address replaced with fake data.
  boards.forEach(board => {
    if (board.Contact) {
      board.Contact = faker.name.findName();
    }
    if (board.Email) {
      board.Email = faker.internet.email(null, null, 'boston.gov');
    }
    if (board.Phone) {
      board.Phone = faker.phone.phoneNumber();
    }
  });

  fs.writeFileSync(
    path.join(FIXTURE_DIR, 'Boards.json'),
    JSON.stringify(boards, null, 2),
    'utf-8'
  );

  const authorities = await commissionsDao.fetchAuthorities(
    boards.map(({ AuthorityId }) => AuthorityId!).filter(id => id !== null)
  );

  fs.writeFileSync(
    path.join(FIXTURE_DIR, 'Authorities.json'),
    JSON.stringify(authorities, null, 2),
    'utf-8'
  );

  const departments = await commissionsDao.fetchDepartments(
    boards.map(({ DepartmentId }) => DepartmentId!).filter(id => id !== null)
  );

  departments.forEach(department => {
    if (!department) {
      return;
    }

    if (department.Manager) {
      department.Manager = faker.name.findName();
    }
    if (department.Email) {
      department.Email = faker.internet.email(null, null, 'boston.gov');
    }
    if (department.Phone) {
      department.Phone = faker.phone.phoneNumber();
    }
  });

  fs.writeFileSync(
    path.join(FIXTURE_DIR, 'Departments.json'),
    JSON.stringify(departments, null, 2),
    'utf-8'
  );

  const policyTypes = await commissionsDao.fetchPolicyTypes();

  fs.writeFileSync(
    path.join(FIXTURE_DIR, 'PolicyTypes.json'),
    JSON.stringify(policyTypes, null, 2),
    'utf-8'
  );

  let members: DbMember[] = [];
  members = members.concat.apply(
    members,
    await Promise.all(
      boards.map(({ BoardID }) => commissionsDao.fetchBoardMembers(BoardID))
    )
  );

  members.forEach(member => {
    if (member.FirstName) {
      member.FirstName = faker.name.firstName();
    }
    if (member.LastName) {
      member.LastName = faker.name.lastName();
    }
  });

  fs.writeFileSync(
    path.join(FIXTURE_DIR, 'BoardMembers.json'),
    JSON.stringify(members, null, 2),
    'utf-8'
  );

  await pool.close();
})().catch(err => {
  console.error(err);
  process.exit(-1);
});
