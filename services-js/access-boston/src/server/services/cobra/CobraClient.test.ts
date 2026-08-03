import * as fs from 'fs';
import * as http2 from 'http2';
import * as https from 'https';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import CobraClient, { getHeaderValue } from './CobraClient';

function createSelfSignedCert(): { certDir: string; key: string; cert: string } {
  const certDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cobra-http-'));
  const keyPath = path.join(certDir, 'server.key');
  const certPath = path.join(certDir, 'server.crt');

  execSync(
    `openssl req -x509 -newkey rsa:2048 -nodes -keyout "${keyPath}" -out "${certPath}" -days 1 -subj "/CN=localhost"`,
    { stdio: 'ignore' }
  );

  return {
    certDir,
    key: fs.readFileSync(keyPath, 'utf8'),
    cert: fs.readFileSync(certPath, 'utf8'),
  };
}

function cleanupCertDir(certDir: string) {
  try {
    fs.unlinkSync(path.join(certDir, 'server.key'));
    fs.unlinkSync(path.join(certDir, 'server.crt'));
    fs.rmdirSync(certDir);
  } catch (cleanupErr) {
    // ignore cleanup errors
  }
}

function restoreEnv(previousEnv: {
  COBRA_HTTP_METHOD?: string;
  COBRA_HOSTNAME?: string;
  COBRA_HOST_PORT?: string;
  COBRA_JWT_TOKEN?: string;
}) {
  const keys: Array<keyof typeof previousEnv> = [
    'COBRA_HTTP_METHOD',
    'COBRA_HOSTNAME',
    'COBRA_HOST_PORT',
    'COBRA_JWT_TOKEN',
  ];
  keys.forEach(key => {
    if (previousEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = previousEnv[key] as string;
    }
  });
}

describe('getHeaderValue', () => {
  it('reads lowercase header keys', () => {
    expect(
      getHeaderValue({ 'content-type': 'application/json' }, 'content-type')
    ).toBe('application/json');
  });

  it('reads mixed-case header keys case-insensitively', () => {
    expect(
      getHeaderValue({ 'Content-Type': 'application/json' }, 'content-type')
    ).toBe('application/json');
    expect(
      getHeaderValue({ 'CONTENT-TYPE': 'text/plain' }, 'Content-Type')
    ).toBe('text/plain');
  });

  it('returns the first value when the header is an array', () => {
    expect(
      getHeaderValue({ 'set-cookie': ['a=1', 'b=2'] }, 'set-cookie')
    ).toBe('a=1');
  });

  it('returns undefined when the header is missing', () => {
    expect(getHeaderValue({}, 'content-type')).toBeUndefined();
  });
});

describe('CobraClient HTTP/2', () => {
  let certDir: string;
  let server: http2.Http2SecureServer;
  let port: number;
  let seenHeaderNames: string[];
  let previousEnv: {
    COBRA_HTTP_METHOD?: string;
    COBRA_HOSTNAME?: string;
    COBRA_HOST_PORT?: string;
    COBRA_JWT_TOKEN?: string;
  };

  beforeAll(done => {
    const generated = createSelfSignedCert();
    certDir = generated.certDir;
    seenHeaderNames = [];

    server = http2.createSecureServer(
      { key: generated.key, cert: generated.cert },
      (req, res) => {
        seenHeaderNames = Object.keys(req.headers).filter(
          name => name.charAt(0) !== ':'
        );

        const body = JSON.stringify({ ok: true, via: 'http2' });
        res.writeHead(200, {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body),
        });
        res.end(body);
      }
    );

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        done.fail('Expected TCP listen address');
        return;
      }
      port = address.port;
      done();
    });
  });

  afterAll(done => {
    server.close(() => {
      cleanupCertDir(certDir);
      done();
    });
  });

  beforeEach(() => {
    previousEnv = {
      COBRA_HTTP_METHOD: process.env.COBRA_HTTP_METHOD,
      COBRA_HOSTNAME: process.env.COBRA_HOSTNAME,
      COBRA_HOST_PORT: process.env.COBRA_HOST_PORT,
      COBRA_JWT_TOKEN: process.env.COBRA_JWT_TOKEN,
    };

    process.env.COBRA_HTTP_METHOD = 'https';
    process.env.COBRA_HOSTNAME = '127.0.0.1';
    process.env.COBRA_HOST_PORT = String(port);
    process.env.COBRA_JWT_TOKEN = 'test-token';
    seenHeaderNames = [];
  });

  afterEach(() => {
    restoreEnv(previousEnv);
  });

  it('requires https for TLS/Cloudflare compatibility', () => {
    process.env.COBRA_HTTP_METHOD = 'http';
    expect(() => new CobraClient()).toThrow(/must be "https"/);
  });

  it('uses HTTP/2 with lowercase request headers and lowercase content-type', async () => {
    const client = new CobraClient();
    const result = await client.post<{ ok: boolean; via: string }>(
      '/api/test',
      {
        body: { hello: 'world' },
      }
    );

    expect(result).toEqual({ ok: true, via: 'http2' });

    const lowerNames = seenHeaderNames.map(name => name.toLowerCase());
    expect(lowerNames).toEqual(seenHeaderNames);
    expect(seenHeaderNames).toContain('authorization');
    expect(seenHeaderNames).toContain('content-type');
    expect(seenHeaderNames).toContain('accept');
    expect(seenHeaderNames).not.toContain('Authorization');
    expect(seenHeaderNames).not.toContain('Content-Type');
  });
});

describe('CobraClient HTTP/1.1 fallback', () => {
  let certDir: string;
  let server: https.Server;
  let port: number;
  let seenHeaderNames: string[];
  let previousEnv: {
    COBRA_HTTP_METHOD?: string;
    COBRA_HOSTNAME?: string;
    COBRA_HOST_PORT?: string;
    COBRA_JWT_TOKEN?: string;
  };

  beforeAll(done => {
    const generated = createSelfSignedCert();
    certDir = generated.certDir;
    seenHeaderNames = [];

    // https.createServer is HTTP/1.1 only (no h2 ALPN), matching cobra*-test today.
    server = https.createServer(
      { key: generated.key, cert: generated.cert },
      (req, res) => {
        seenHeaderNames = Object.keys(req.headers);

        const body = JSON.stringify({ ok: true, via: 'http1.1' });
        res.writeHead(200, {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body),
        });
        res.end(body);
      }
    );

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        done.fail('Expected TCP listen address');
        return;
      }
      port = address.port;
      done();
    });
  });

  afterAll(done => {
    server.close(() => {
      cleanupCertDir(certDir);
      done();
    });
  });

  beforeEach(() => {
    previousEnv = {
      COBRA_HTTP_METHOD: process.env.COBRA_HTTP_METHOD,
      COBRA_HOSTNAME: process.env.COBRA_HOSTNAME,
      COBRA_HOST_PORT: process.env.COBRA_HOST_PORT,
      COBRA_JWT_TOKEN: process.env.COBRA_JWT_TOKEN,
    };

    process.env.COBRA_HTTP_METHOD = 'https';
    process.env.COBRA_HOSTNAME = '127.0.0.1';
    process.env.COBRA_HOST_PORT = String(port);
    process.env.COBRA_JWT_TOKEN = 'test-token';
    seenHeaderNames = [];
  });

  afterEach(() => {
    restoreEnv(previousEnv);
  });

  it('falls back to HTTP/1.1 when HTTP/2 is not negotiated', async () => {
    const client = new CobraClient();
    const result = await client.post<{ ok: boolean; via: string }>(
      '/api/test',
      {
        body: { hello: 'world' },
      }
    );

    expect(result).toEqual({ ok: true, via: 'http1.1' });
    expect(seenHeaderNames.map(name => name.toLowerCase())).toEqual(
      expect.arrayContaining(['authorization', 'content-type', 'accept'])
    );
  });
});
