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

type LogIntegration = 'iamdir' | 'graphql';
type LogOutcome = 'REQUEST' | 'SUCCESS' | 'ERROR';

/**
 * Human-readable multi-line logs so request / success / error and
 * iamdir vs graphql are easy to scan. Body stays JSON for structure.
 *
 * Example:
 *   [12345] iamdir REQUEST  search
 *     endpoint: ldap://iamdir/ou=groups,...
 *     body: {"filter":"(cn=*)"}
 *
 *   [12345] iamdir SUCCESS  search
 *     endpoint: ldap://iamdir/ou=groups,...
 *     status: 0
 *     body: {"entryCount":2,"entries":[...]}
 *
 *   [12345] graphql ERROR   getMinimumUserGroups
 *     body: ["Internal Server Error"]
 */
function logLine(
  integration: LogIntegration,
  userId: string,
  outcome: LogOutcome,
  operation: string,
  fields: {
    endpoint?: string;
    status?: number | string | null;
    body?: unknown;
    variables?: unknown;
  }
) {
  const paddedOutcome = outcome.padEnd(7);
  const op = operation || '(unknown)';
  console.log(`[${userId}] ${integration} ${paddedOutcome} ${op}`);

  if (fields.endpoint) {
    console.log(`  endpoint: ${fields.endpoint}`);
  }
  if (fields.status !== undefined && fields.status !== null) {
    console.log(`  status: ${fields.status}`);
  }
  if (fields.variables !== undefined) {
    console.log(`  variables: ${safeJson(fields.variables)}`);
  }
  if (fields.body !== undefined) {
    console.log(`  body: ${safeJson(fields.body)}`);
  }
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
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
  logLine('iamdir', ctx.userId, 'REQUEST', operation, {
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
  logLine('iamdir', ctx.userId, 'SUCCESS', operation, {
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
  logLine('iamdir', ctx.userId, 'ERROR', operation, {
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
    // LDAP result status 0 = success. Non-zero is an IAMDIR/LDAP result
    // code (not GraphQL). Stream/transport failures use the 'error' event.
    if (status === 0) {
      logIamdirResponse(ctx, 'search', baseDn, status, responseBody);
    } else {
      logIamdirError(ctx, 'search', baseDn, status, {
        ...responseBody,
        message: `LDAP result status ${status}`,
        request: requestBody,
      });
    }
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
  logLine('graphql', userId, 'ERROR', details.operation || '(unknown)', {
    variables: details.variables,
    body: details.errors.map(e => e.message || String(e)),
  });
}
