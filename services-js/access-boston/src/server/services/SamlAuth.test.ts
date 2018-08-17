import { makeIdentityProvider, parseGroupsAttribute } from './SamlAuth';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

describe('makeIdentityProvider', () => {
  let samlMetadata: Buffer;

  beforeEach(() => {
    samlMetadata = fs.readFileSync(
      path.join(__dirname, '../../../fixtures/saml-metadata.xml')
    );
  });

  it('parses the xml', async () => {
    const identityProvider = await makeIdentityProvider(samlMetadata);
    expect(identityProvider).toMatchSnapshot();
  });

  it('returns valid certificates', async () => {
    const identityProvider = await makeIdentityProvider(samlMetadata);
    const certificate = identityProvider.certificates[0];

    // We use publicEncrypt just to test that the certificate is parsable.
    const out = crypto.publicEncrypt(certificate, new Buffer('TEST TEXT'));
    expect(out.toString('base64').length).toBeGreaterThan(1);
  });
});

describe('parseGroupsAttribute', () => {
  it('parses out group names', () => {
    const groupsAttribute = [
      'cn=COB-Group-TestGrp01,cn=Groups,dc=boston,dc=cob',
      'cn=SG_AB_IAM_TEAM,cn=Groups,dc=boston,dc=cob',
      'cn=SG_AB_SERVICEDESK_USERS,cn=Groups,dc=boston,dc=cob',
    ];

    expect(parseGroupsAttribute(groupsAttribute)).toEqual([
      'COB-Group-TestGrp01',
      'SG_AB_IAM_TEAM',
      'SG_AB_SERVICEDESK_USERS',
    ]);
  });
});
