import { Request as HapiRequest } from 'hapi';
import Boom from 'boom';

export interface Session {
  nameId: string;
  sessionIndex: string;
  groups: string[];
}

export default class SessionAuth {
  request: HapiRequest;

  constructor(request: HapiRequest) {
    this.request = request;
  }

  get(): Session {
    const session: Session | null = this.request.auth.credentials as any;

    if (!session) {
      throw Boom.internal('SessionAuth#get called for null session');
    }

    return session;
  }

  set(session: Session) {
    (this.request as any).cookieAuth.set(session);
  }

  clear() {
    (this.request as any).cookieAuth.clear();
  }
}
