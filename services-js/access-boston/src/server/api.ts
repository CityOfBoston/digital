import { InfoResponse } from '../lib/api';
import AppsRegistry from './AppsRegistry';

export interface Session {
  nameId: string;
  sessionIndex: string;
  groups: string[];
}

export async function infoForUser(
  appsRegistry: AppsRegistry,
  session: Session
): Promise<InfoResponse> {
  const identityIqUrl =
    process.env.IDENTITY_IQ_URL ||
    'https://identity-dev.boston.gov/identityiq/';

  return {
    employeeId: session.nameId,
    requestAccessUrl: '#',
    accountTools: [
      {
        name: 'Change password',
        url: `${identityIqUrl}changePassword.jsf`,
      },
      {
        name: 'Manage device',
        url: `#`,
      },
    ],

    categories: appsRegistry.appsForGroups(session.groups),
  };
}
