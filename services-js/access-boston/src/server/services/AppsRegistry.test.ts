import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

import AppsRegistry from './AppsRegistry';

describe('appsForUserTypeAndGroups', () => {
  let appsRegistry: AppsRegistry;

  beforeEach(() => {
    const yamlFixture = yaml.safeLoad(
      fs.readFileSync(
        path.resolve(__dirname, '../../../fixtures/apps.yaml'),
        'utf-8'
      )
    );

    appsRegistry = new AppsRegistry(yamlFixture);
  });

  it('returns just the "everyone" category for no groups', () => {
    expect(appsRegistry.appsForGroups([])).toMatchSnapshot();
  });

  it('returns apps for a group', () => {
    // This checks that categories with no apps are not returned
    expect(appsRegistry.appsForGroups(['SG_AB_IAM_TEAM'])).toMatchSnapshot();
  });
});
