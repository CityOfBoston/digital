import fs from 'fs';
import { DOMParser } from 'xmldom';
import xpath from 'xpath';
import { IdentityProvider, ServiceProvider } from 'saml2-js';

export interface SamlConfigPaths {
  serviceProviderKeyPath: string;
  serviceProviderCertPath: string;
  metadataPath: string;
}

interface SamlResponseHeader {
  version: '2.0';
  destination: string;
  in_response_to: string;
  id: string;
}

interface SamlAuthAssertion {
  response_header: SamlResponseHeader;
  type: 'authn_response';
  user: {
    name_id: string;
    session_index: string;
    attributes: {
      groups?: string[];
      FirstName?: string[];
      LastName?: string[];
      email?: string[];
      changePasswordRequired?: string[];
      mfaRegistrationRequired?: string[];
      userAccessToken?: string[];
      userMFARegistrationDate?: string[];
      isUserRegistered?: string[];
      cobUserAgency?: string[];
    };
  };
}

interface SamlLogoutRequestAssertion {
  response_header: SamlResponseHeader;
  type: 'logout_request';
  issuer: string;
  name_id: string;
  session_index: string;
}

type SamlAssertion = SamlAuthAssertion | SamlLogoutRequestAssertion;

export type SamlRequestPostBody = {
  SAMLRequest: string;
  RelayState: string;
};

export type SamlResponsePostBody = {
  SAMLResponse: string;
};

export interface ServiceProviderConfig {
  metadataUrl: string;
  assertUrl: string;
}

export interface SamlLoginResult {
  type: 'login';
  nameId: string;
  sessionIndex: string;
  firstName: string;
  lastName: string;
  email: string;
  groups: string[];
  needsNewPassword: boolean;
  needsMfaDevice: boolean;
  hasMfaDevice: boolean;
  userAccessToken: string;
  /** Format is MM/DD/YYYY */
  userMfaRegistrationDate: string | null;
  cobAgency: string | null;
  // displayName: string | null;
}

export interface SamlLogoutRequestResult {
  type: 'logout';
  requestId: string;
  nameId: string;
  sessionIndex: string;
}

export type SamlAssertResult = SamlLoginResult | SamlLogoutRequestResult;

const SAML_METADATA_NAMESPACES = {
  md: 'urn:oasis:names:tc:SAML:2.0:metadata',
  ds: 'http://www.w3.org/2000/09/xmldsig#',
};

const REDIRECT_BINDING_URI =
  'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect';

export async function makeIdentityProvider(
  metadata: Buffer,
  logoutUrl: string | null = null
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
    sso_logout_url: logoutUrl || redirectUrl,
    sign_get_request: signRequests,
    certificates,
  });
}

export async function makeServiceProvider(
  { metadataUrl, assertUrl }: ServiceProviderConfig,
  serviceProviderCert: Buffer,
  serviceProviderKey: Buffer
) {
  const privateKey = serviceProviderKey.toString('utf-8');
  const cert = serviceProviderCert.toString('utf-8');

  return new ServiceProvider({
    entity_id: metadataUrl,
    private_key: privateKey,
    certificate: cert,
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
  serviceProviderConfig: ServiceProviderConfig,
  logoutUrl: string
): Promise<SamlAuth> {
  const metadata: Promise<Buffer | null> = new Promise((resolve, reject) => {
    fs.readFile(metadataPath, (err, buf) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve(null);
        } else {
          reject(err);
        }
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

  const metadataBuffer = await metadata;

  const [identityProvider, serviceProvider] = await Promise.all([
    metadataBuffer ? makeIdentityProvider(metadataBuffer, logoutUrl) : null,
    makeServiceProvider(
      serviceProviderConfig,
      await serviceProviderCert,
      await serviceProviderKey
    ),
  ]);

  return new SamlAuth(identityProvider, serviceProvider);
}

export default class SamlAuth {
  private identityProvider: IdentityProvider | null;
  private serviceProvider: ServiceProvider;

  constructor(
    identityProvider: IdentityProvider | null,
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

  public makeLogoutSuccessUrl(
    requestId: string,
    relayState: string
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.serviceProvider.create_logout_response_url(
        this.identityProvider,
        {
          in_response_to: requestId,
          sign_get_request: true,
          relay_state: relayState,
        },
        (err, successUrl) => {
          if (err) {
            reject(err);
          } else {
            resolve(successUrl);
          }
        }
      );
    });
  }

  private async processSamlAssertion(
    saml: SamlAssertion
  ): Promise<SamlAssertResult> {
    switch (saml.type) {
      case 'authn_response': {
        const { user } = saml;
        const { attributes } = user;

        return {
          type: 'login',
          nameId: user.name_id,
          sessionIndex: user.session_index,
          firstName: (attributes.FirstName && attributes.FirstName[0]) || '',
          lastName: (attributes.LastName && attributes.LastName[0]) || '',
          email: (attributes.email && attributes.email[0]) || '',
          groups: attributes.groups || [],
          needsNewPassword: attributeIsTrue(attributes.changePasswordRequired),
          needsMfaDevice: attributeIsTrue(attributes.mfaRegistrationRequired),
          hasMfaDevice: attributeIsTrue(attributes.isUserRegistered),
          userAccessToken:
            (attributes.userAccessToken && attributes.userAccessToken[0]) || '',
          userMfaRegistrationDate:
            (attributes.userMFARegistrationDate &&
              attributes.userMFARegistrationDate[0]) ||
            null,
          cobAgency:
            (attributes.cobUserAgency && attributes.cobUserAgency[0]) || null,
          // displayName: (attributes.FirstName && attributes.FirstName[0]) || '',
        };
      }
      case 'logout_request':
        return {
          type: 'logout',
          requestId: saml.response_header.id,
          nameId: saml.name_id,
          sessionIndex: saml.session_index,
        };

      default:
        throw new Error(
          `Unrecognized SAML assertion type: ${(saml as any).type}`
        );
    }
  }

  handlePostAssert(
    body: SamlRequestPostBody | SamlResponsePostBody
  ): Promise<SamlAssertResult> {
    return new Promise((resolve, reject) => {
      // Log the incoming SAML response for debugging
      // eslint-disable-next-line no-console
      console.log('[SAML] handlePostAssert: Received SAML response body keys:', Object.keys(body));
      
      // Try to decode and log the actual SAML response if present
      if ('SAMLResponse' in body && body.SAMLResponse) {
        try {
          const decodedSaml = Buffer.from(body.SAMLResponse, 'base64').toString('utf-8');
          // eslint-disable-next-line no-console
          console.log('[SAML] Decoded SAMLResponse XML (first 1000 chars):', decodedSaml.substring(0, 1000));
          
          // Look for Status elements in the XML
          const statusMatch = decodedSaml.match(/<samlp?:Status[^>]*>[\s\S]*?<\/samlp?:Status>/i);
          if (statusMatch) {
            // eslint-disable-next-line no-console
            console.log('[SAML] Status section from SAML response:', statusMatch[0]);
          }
        } catch (decodeErr) {
          // eslint-disable-next-line no-console
          console.error('[SAML] Failed to decode SAMLResponse:', decodeErr);
        }
      }
      
      this.serviceProvider.post_assert(
        this.identityProvider,
        { request_body: body },
        (err, saml: SamlAssertion) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.error('============ SAML ASSERTION ERROR - START ============');
            // eslint-disable-next-line no-console
            console.error('[SAML ERROR] Error name:', err.name);
            // eslint-disable-next-line no-console
            console.error('[SAML ERROR] Error message:', err.message);
            
            // Use Object.getOwnPropertyNames to properly serialize error objects
            // eslint-disable-next-line no-console
            console.error('[SAML ERROR] Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
            
            // Specifically extract and log the status details
            if (err.extra && err.extra.status) {
              // eslint-disable-next-line no-console
              console.error('[SAML ERROR] Status object keys:', Object.keys(err.extra.status));
              
              // Log each status code and its nested values
              Object.keys(err.extra.status).forEach(statusCode => {
                // eslint-disable-next-line no-console
                console.error(`[SAML ERROR] Status[${statusCode}]:`, JSON.stringify(err.extra.status[statusCode], null, 2));
              });
            }
            
            // Log additional error properties
            if (err.extra) {
              // eslint-disable-next-line no-console
              console.error('[SAML ERROR] Extra properties:', JSON.stringify(err.extra, null, 2));
            }
            
            // Log stack trace if available
            if (err.stack) {
              // eslint-disable-next-line no-console
              console.error('[SAML ERROR] Stack trace:', err.stack);
            }
            
            // eslint-disable-next-line no-console
            console.error('============ SAML ASSERTION ERROR - END ============');

            reject(err);
            return;
          }

          // eslint-disable-next-line no-console
          console.log('[SAML] handlePostAssert: Successfully processed SAML assertion, type:', saml.type);

          try {
            resolve(this.processSamlAssertion(saml));
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[SAML] handlePostAssert: Error processing SAML assertion:', e);
            reject(e);
          }
        }
      );
    });
  }

  handleGetAssert(query: {
    [key: string]: string | string[];
  }): Promise<SamlAssertResult> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-console
      console.log('[SAML] handleGetAssert: Received query keys:', Object.keys(query));
      
      this.serviceProvider.redirect_assert(
        this.identityProvider,
        { request_body: query },
        (err, saml: SamlAssertion) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.error('============ SAML GET ASSERTION ERROR - START ============');
            // eslint-disable-next-line no-console
            console.error('[SAML GET ERROR] Error name:', err.name);
            // eslint-disable-next-line no-console
            console.error('[SAML GET ERROR] Error message:', err.message);
            
            // Use Object.getOwnPropertyNames to properly serialize error objects
            // eslint-disable-next-line no-console
            console.error('[SAML GET ERROR] Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
            
            // Specifically extract and log the status details
            if (err.extra && err.extra.status) {
              // eslint-disable-next-line no-console
              console.error('[SAML GET ERROR] Status codes found:', Object.keys(err.extra.status));
              
              Object.keys(err.extra.status).forEach(statusCode => {
                // eslint-disable-next-line no-console
                console.error(`[SAML GET ERROR] Status[${statusCode}]:`, JSON.stringify(err.extra.status[statusCode], null, 2));
              });
            }
            
            // Log the query with better serialization
            // eslint-disable-next-line no-console
            console.error('[SAML GET ERROR] Query keys:', Object.keys(query));
            // eslint-disable-next-line no-console
            console.error('[SAML GET ERROR] Query that caused error:', JSON.stringify(query, null, 2));
            
            // If query is empty, it might be from the logout pixel tracker
            if (Object.keys(query).length === 0) {
              // eslint-disable-next-line no-console
              console.error('[SAML GET ERROR] Empty query detected - this may be from the /ext/idplogout pixel tracker on /register page');
            }
            
            // eslint-disable-next-line no-console
            console.error('============ SAML GET ASSERTION ERROR - END ============');

            reject(err);
            return;
          }

          // eslint-disable-next-line no-console
          console.log('[SAML] handleGetAssert: Successfully processed assertion, type:', saml.type);

          try {
            resolve(this.processSamlAssertion(saml));
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[SAML] handleGetAssert: Error processing assertion:', e);
            reject(e);
          }
        }
      );
    });
  }
}

const attributeIsTrue = (attr: string[] | undefined): boolean =>
  !!(attr && attr[0] && attr[0].toLowerCase() === 'true');
