import path from 'path';
import PermitFiles from './PermitFiles';
import { PACKAGE_ROOT } from '../util';

jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'info').mockImplementation();
jest.spyOn(console, 'time').mockImplementation();
jest.spyOn(console, 'timeEnd').mockImplementation();

describe('lookupPermit', () => {
  let permitFiles: PermitFiles;

  beforeEach(async () => {
    permitFiles = new PermitFiles();
    await permitFiles.loadFromDir(path.join(PACKAGE_ROOT, 'fixtures'));
  });

  it('looks up a permit and its info', async () => {
    await expect(permitFiles.lookupPermit('X49106288')).resolves
      .toMatchInlineSnapshot(`
            Object {
              "data": Object {
                "Address": "2434 PENNSYLVANIA AVENUE, MATTAPAN 02126",
                "BuildingOrFire": "Building",
                "City": "Mattapan",
                "PermitNumber": "X49106288",
                "PermitPOCName": "GEORGE R. SMITH",
                "PermitType": "Use of Premises",
                "State": "MA",
                "Zip": "02126",
              },
              "milestones": Array [
                Object {
                  "AverageDurationOfMilestone": "3457551",
                  "CityContactName": "JON R ACEVEDO",
                  "MilestoneEndDate": "2019-05-17 16:03:07.027000",
                  "MilestoneName": "PlanningZoning",
                  "MilestoneStartDate": "2012-10-19 14:12:44.877000",
                  "PermitNumber": "X49106288",
                },
              ],
              "reviews": Array [
                Object {
                  "IsAssignedFlag": "Y",
                  "IsCompleteFlag": "N",
                  "IsStartedFlag": "N",
                  "PermitNumber": "X49106288",
                  "ReviewStatus": " ",
                  "ReviewType": "Building Review",
                  "ReviewerName": "JON R ACEVEDO",
                },
                Object {
                  "IsAssignedFlag": "Y",
                  "IsCompleteFlag": "N",
                  "IsStartedFlag": "N",
                  "PermitNumber": "X49106288",
                  "ReviewStatus": " ",
                  "ReviewType": "Zoning Review",
                  "ReviewerName": "JON R ACEVEDO",
                },
              ],
            }
          `);
  });
});

describe('loading new data', () => {
  it('replaces old data with new data', async () => {
    const permitFiles = new PermitFiles();

    await permitFiles.loadFromDir(path.join(PACKAGE_ROOT, 'fixtures'));
    await expect(permitFiles.lookupPermit('X49106288')).resolves.toBeDefined();

    // This loads data from a new place, making a new generation and getting rid
    // of the old one.
    await permitFiles.loadFromDir(
      path.join(PACKAGE_ROOT, 'fixtures', 'alternate')
    );

    // This is a new permit in the new generation
    await expect(permitFiles.lookupPermit('X49106290')).resolves.toBeDefined();

    // The old permit isn't in the new files, so this goes back to null
    await expect(permitFiles.lookupPermit('X49106288')).resolves.toBeNull();
  });
});
