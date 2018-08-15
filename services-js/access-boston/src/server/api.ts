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
  return {
    employeeId: session.nameId,
    requestAccessUrl: '#',
    categories: appsRegistry.appsForGroups(session.groups),
  };
}
