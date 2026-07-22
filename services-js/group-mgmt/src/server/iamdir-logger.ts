/* eslint no-console: 0 */

/** Who context for IAM directory (LDAP) integration logs. */
export type IamdirLogContext = {
  userId: string;
  /** When true, skip request/response logs (e.g. health checks); errors still log. */
  silent?: boolean;
};

export const IAMDIR_UNKNOWN: IamdirLogContext = { userId: 'unknown' };

export const IAMDIR_HEALTH_CHECK: IamdirLogContext = {
  userId: 'health-check',
  silent: true,
};

/** Header access-boston sends with the SAML subject / employee id. */
export const AB_USER_ID_HEADER = 'x-ab-user-id';

let ldapUrl = '';

export function setIamdirLdapUrl(url: string) {
  ldapUrl = url;
}

function iamdirEndpoint(baseDn: string): string {
  const base = ldapUrl || 'ldap://iamdir';
  const dn = baseDn || '';
  return dn ? `${base}/${dn}` : base;
}

function logLine(userId: string, payload: Record<string, unknown>) {
  console.log(`[${userId}]`, JSON.stringify(payload));
}

export function logIamdirRequest(
  ctx: IamdirLogContext,
  operation: string,
  baseDn: string,
  body: unknown
) {
  if (ctx.silent) {
    return;
  }
  logLine(ctx.userId, {
    integration: 'iamdir',
    phase: 'request',
    operation,
    endpoint: iamdirEndpoint(baseDn),
    body,
  });
}

export function logIamdirResponse(
  ctx: IamdirLogContext,
  operation: string,
  baseDn: string,
  status: number | string | null,
  body: unknown
) {
  if (ctx.silent) {
    return;
  }
  logLine(ctx.userId, {
    integration: 'iamdir',
    phase: 'response',
    operation,
    endpoint: iamdirEndpoint(baseDn),
    status,
    body,
  });
}

export function logIamdirError(
  ctx: IamdirLogContext,
  operation: string,
  baseDn: string,
  status: number | string | null,
  body: unknown
) {
  logLine(ctx.userId, {
    integration: 'iamdir',
    phase: 'error',
    operation,
    endpoint: iamdirEndpoint(baseDn),
    status,
    body,
  });
}

const MAX_RESPONSE_ENTRIES = 50;

function summarizeLdapEntry(entry: {
  object?: { dn?: string; [key: string]: unknown };
}) {
  const po = entry.object || {};
  const summary: Record<string, unknown> = {};
  if (po.dn) summary.dn = po.dn;
  ['cn', 'givenname', 'sn', 'displayname', 'memberof', 'uniquemember'].forEach(
    key => {
      if (po[key] !== undefined) {
        summary[key] = po[key];
      }
    }
  );
  return summary;
}

/** Attach response logging to an ldapjs search result stream. */
export function attachIamdirSearchStreamLogging(
  res:
    | { on: (ev: string, fn: (...args: any[]) => void) => void }
    | null
    | undefined,
  ctx: IamdirLogContext,
  baseDn: string,
  requestBody: unknown
) {
  if (!res || typeof res.on !== 'function') {
    return;
  }

  let entryCount = 0;
  const entries: Record<string, unknown>[] = [];

  res.on(
    'searchEntry',
    (entry: { object?: { dn?: string; [key: string]: unknown } }) => {
      entryCount++;
      if (entryCount <= MAX_RESPONSE_ENTRIES) {
        entries.push(summarizeLdapEntry(entry));
      }
    }
  );

  res.on('error', (err: { message?: string; code?: number }) => {
    logIamdirError(
      ctx,
      'search',
      baseDn,
      err && err.code != null ? err.code : null,
      {
        message: err && err.message ? err.message : String(err),
        request: requestBody,
      }
    );
  });

  res.on('end', (result: { status?: number } | null) => {
    if (ctx.silent) {
      return;
    }
    const status =
      result && typeof result.status === 'number' ? result.status : 0;
    const responseBody: Record<string, unknown> = { entryCount, entries };
    if (entryCount > MAX_RESPONSE_ENTRIES) {
      responseBody.truncated = true;
      responseBody.truncatedAfter = MAX_RESPONSE_ENTRIES;
    }
    logIamdirResponse(ctx, 'search', baseDn, status, responseBody);
  });
}

export function logGraphqlError(
  userId: string,
  details: {
    operation?: string;
    variables?: unknown;
    errors: Array<{ message?: string }>;
  }
) {
  logLine(userId, {
    integration: 'graphql',
    phase: 'error',
    operation: details.operation,
    variables: details.variables,
    body: details.errors.map(e => e.message || String(e)),
  });
}
