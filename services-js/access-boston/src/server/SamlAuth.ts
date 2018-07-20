import fs from 'fs';
import { DOMParser } from 'xmldom';
import xpath from 'xpath';
import { IdentityProvider, ServiceProvider } from 'saml2-js';

export interface SamlConfigPaths {
  serviceProviderKeyPath: string;
  serviceProviderCertPath: string;
  metadataPath: string;
}

interface SamlAssertion {
  response_header: {
    version: '2.0';
    destination: string;
    in_response_to: string;
    id: string;
  };
  type: 'authn_response';
  user: {
    name_id: string;
    session_index: string;
    attributes: object;
  };
}

export interface ServiceProviderConfig {
  metadataUrl: string;
  assertUrl: string;
}

export interface SamlLoginResult {
  type: 'login';
  nameId: string;
  sessionIndex: string;
}

const SAML_METADATA_NAMESPACES = {
  md: 'urn:oasis:names:tc:SAML:2.0:metadata',
  ds: 'http://www.w3.org/2000/09/xmldsig#',
};

const REDIRECT_BINDING_URI =
  'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect';

export async function makeIdentityProvider(
  metadata: Buffer
): Promise<IdentityProvider> {
  const parser = new DOMParser();
  const select = xpath.useNamespaces(SAML_METADATA_NAMESPACES);
  const doc = parser.parseFromString(metadata.toString('utf-8'));

  const ssoDescriptorElement = select(
    '//md:IDPSSODescriptor',
    doc,
    true
  ) as Element;

  const signRequests =
    ssoDescriptorElement.getAttribute('WantAuthnRequestsSigned') === 'true';

  const redirectBindingElement = select(
    `//md:SingleSignOnService[@Binding='${REDIRECT_BINDING_URI}']`,
    doc,
    true
  ) as Element;

  const redirectUrl = redirectBindingElement.getAttribute('Location') || '';

  const signingCertificateElements = select(
    "//md:KeyDescriptor[@use='signing']",
    doc
  ) as Element[];

  // The textContent is a Base64-encoded binary cert in DER format. We can
  // turn that into PEM just by adding the BEGIN/END bits.
  //
  // If we format the XML then there are some newlines around the Base64
  // content than need to be trimmed.
  const certificates = signingCertificateElements.map(el =>
    [
      '-----BEGIN CERTIFICATE-----',
      el.textContent!.trim(),
      '-----END CERTIFICATE-----',
    ].join('\n')
  );

  return new IdentityProvider({
    sso_login_url: redirectUrl,
    sso_logout_url: redirectUrl,
    sign_get_request: signRequests,
    certificates,
  });
}

export async function makeServiceProvider(
  { metadataUrl, assertUrl }: ServiceProviderConfig,
  serviceProviderCert: Buffer,
  serviceProviderKey: Buffer
) {
  return new ServiceProvider({
    entity_id: metadataUrl,
    private_key: serviceProviderKey.toString('utf-8'),
    certificate: serviceProviderCert.toString('utf-8'),
    assert_endpoint: assertUrl,
    allow_unencrypted_assertion: true,
  });
}

export async function makeSamlAuth(
  {
    serviceProviderKeyPath,
    serviceProviderCertPath,
    metadataPath,
  }: SamlConfigPaths,
  serviceProviderConfig: ServiceProviderConfig
): Promise<SamlAuth> {
  const metadata: Promise<Buffer> = new Promise((resolve, reject) => {
    fs.readFile(metadataPath, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf);
      }
    });
  });

  const serviceProviderKey: Promise<Buffer> = new Promise((resolve, reject) => {
    fs.readFile(serviceProviderKeyPath, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf);
      }
    });
  });

  const serviceProviderCert: Promise<Buffer> = new Promise(
    (resolve, reject) => {
      fs.readFile(serviceProviderCertPath, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf);
        }
      });
    }
  );

  const [identityProvider, serviceProvider] = await Promise.all([
    makeIdentityProvider(await metadata),
    makeServiceProvider(
      serviceProviderConfig,
      await serviceProviderKey,
      await serviceProviderCert
    ),
  ]);

  return new SamlAuth(identityProvider, serviceProvider);
}

export default class SamlAuth {
  private identityProvider: IdentityProvider;
  private serviceProvider: ServiceProvider;

  constructor(
    identityProvider: IdentityProvider,
    serviceProvider: ServiceProvider
  ) {
    this.identityProvider = identityProvider;
    this.serviceProvider = serviceProvider;
  }

  getMetadata(): string {
    return this.serviceProvider.create_metadata();
  }

  makeLoginUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.serviceProvider.create_login_request_url(
        this.identityProvider,
        {},
        (err, loginUrl) => {
          if (err) {
            return reject(err);
          }

          resolve(loginUrl);
        }
      );
    });
  }

  makeLogoutUrl(nameId: string, sessionIndex: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.serviceProvider.create_logout_request_url(
        this.identityProvider,
        {
          name_id: nameId,
          session_index: sessionIndex,
        },
        (err, logoutUrl) => {
          if (err) {
            return reject(err);
          }

          resolve(logoutUrl);
        }
      );
    });
  }

  handlePostAssert(body: string): Promise<SamlLoginResult> {
    return new Promise((resolve, reject) => {
      this.serviceProvider.post_assert(
        this.identityProvider,
        { request_body: body },
        (err, saml: SamlAssertion) => {
          if (err) {
            reject(err);
            return;
          }

          // eslint-disable-next-line no-console
          console.log('SAML RESPONSE', JSON.stringify(saml, null, 2));

          try {
            const samlLoginResult: SamlLoginResult = {
              type: 'login',
              nameId: saml.user.name_id,
              sessionIndex: saml.user.session_index,
            };

            resolve(samlLoginResult);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }
}
