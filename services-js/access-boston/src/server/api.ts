import { InfoResponse } from '../lib/api';

export interface Session {
  nameId: string;
  sessionIndex: string;
}

export async function infoForUser(session: Session): Promise<InfoResponse> {
  const identityIqUrl =
    process.env.IDENTITY_IQ_URL ||
    'https://identity-dev.boston.gov/identityiq/';

  return {
    employeeId: session.nameId,
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
  };
}
