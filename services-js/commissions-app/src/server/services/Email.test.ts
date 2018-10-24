import { namesFromIds } from './Email';

describe('namesFromIds', () => {
  it('creates an array of names from array of ids', () => {
    const commissionsList = [
      { BoardName: 'Board 1', BoardID: 1 },
      { BoardName: 'Board 2', BoardID: 2 },
      { BoardName: 'Board 3', BoardID: 3 },
    ];

    const commissionIds = ['3', '1'];

    const result = namesFromIds(commissionsList, commissionIds);

    expect(result).toEqual(['Board 1', 'Board 3']);
  });
});
