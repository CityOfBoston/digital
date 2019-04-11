import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

import AppsRegistry from './AppsRegistry';

describe('appsForUserTypeAndGroups', () => {
  let appsRegistry: AppsRegistry;

  beforeEach(() => {
    const yamlFixture = yaml.safeLoad(
      fs.readFileSync(
        path.resolve(__dirname, '../../fixtures/apps.yaml'),
        'utf-8'
      )
    );

    appsRegistry = new AppsRegistry(yamlFixture);
  });

  it('returns just the "everyone" category for no groups', () => {
    expect(appsRegistry.appsForGroups([], false, 'CH')).toMatchSnapshot();
  });

  it('returns apps for a group', () => {
    // This checks that categories with no apps are not returned
    expect(
      appsRegistry.appsForGroups(['SG_AB_IAM_TEAM'], false, 'CH')
    ).toMatchSnapshot();
  });

  it('returns apps for an agency', () => {
    // This checks that categories with no apps are not returned
    expect(
      appsRegistry.appsForGroups(['SG_AB_IAM_TEAM'], false, 'BPS')
    ).toMatchSnapshot();
  });

  it('doesn’t return agency apps if none is specified', () => {
    // This checks that categories with no apps are not returned
    expect(
      appsRegistry.appsForGroups(['SG_AB_IAM_TEAM'], false, null)
    ).toMatchSnapshot();
  });

  it('returns apps that require an MFA device', () => {
    // This checks that categories with no apps are not returned
    expect(appsRegistry.appsForGroups([], true, 'CH')).toMatchSnapshot();
  });
});
