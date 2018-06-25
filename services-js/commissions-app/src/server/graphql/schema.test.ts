import { commissionResolvers } from './schema';
import CommissionsDao, { DbBoard, DbAuthority } from '../dao/CommissionsDao';

jest.mock('../dao/CommissionsDao');

const STATE_AUTHORITY: DbAuthority = {
  AuthorityId: 4,
  AuthorityType: 'State',
  AddBy: '',
  AddDtTm: new Date(),
  ModBy: '',
  ModDtTm: new Date(),
};

const NOT_APPLICABLE_AUTHORITY: DbAuthority = {
  AuthorityId: 4,
  AuthorityType: 'Not applicable',
  AddBy: '',
  AddDtTm: new Date(),
  ModBy: '',
  ModDtTm: new Date(),
};

beforeEach(() => {
  const MockCommissionsDao = CommissionsDao as jest.Mock<CommissionsDao>;
  MockCommissionsDao.mockClear();
});

describe('Commission resolvers', () => {
  describe('authority', () => {
    let board: DbBoard;
    let commissionsDao: jest.Mocked<CommissionsDao>;

    beforeEach(() => {
      board = {} as any;
      commissionsDao = new CommissionsDao(null as any) as any;
    });

    it('handles when the authority ID is null', async () => {
      board.AuthorityId = null;

      expect(
        await commissionResolvers.authority(board, {}, { commissionsDao }, {})
      ).toEqual(null);
    });

    it('returns the authority name', async () => {
      board.AuthorityId = 4;

      commissionsDao.fetchAuthority.mockReturnValue(
        Promise.resolve(STATE_AUTHORITY)
      );

      expect(
        await commissionResolvers.authority(board, {}, { commissionsDao }, {})
      ).toEqual('State');
    });

    it('turns a “Not Applicable” authority into null', async () => {
      board.AuthorityId = 4;

      commissionsDao.fetchAuthority.mockReturnValue(
        Promise.resolve(NOT_APPLICABLE_AUTHORITY)
      );

      expect(
        await commissionResolvers.authority(board, {}, { commissionsDao }, {})
      ).toEqual(null);
    });
  });
});
