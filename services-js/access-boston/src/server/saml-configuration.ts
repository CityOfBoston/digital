import fs from 'fs';
import { DOMParser } from 'xmldom';
import xpath from 'xpath';

const NAMESPACES = {
  md: 'urn:oasis:names:tc:SAML:2.0:metadata',
  ds: 'http://www.w3.org/2000/09/xmldsig#',
};

const REDIRECT_BINDING = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect';

export interface SamlConfig {
  loginUrl: string;
  logoutUrl: string;
  signRequests: boolean;
  /** PEM-encoded certificates */
  certificates: string[];
}

export async function loadSamlConfiguration(path: string): Promise<SamlConfig> {
  const parser = new DOMParser();
  const select = xpath.useNamespaces(NAMESPACES);

  const doc = await new Promise<Node>((resolve, reject) => {
    fs.readFile(path, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(parser.parseFromString(buf.toString()));
      }
    });
  });

  const ssoDescriptorElement = select(
    '//md:IDPSSODescriptor',
    doc,
    true
  ) as Element;
  const signRequests =
    ssoDescriptorElement.getAttribute('WantAuthnRequestsSigned') === 'true';

  const signingCertificateElements = select(
    "//md:KeyDescriptor[@use='signing']",
    doc
  ) as Element[];

  const certificates = signingCertificateElements.map(node =>
    // The textContent is a Base64-encoded binary cert in DER format. We can
    // turn that into PEM just by adding the BEGIN/END bits.
    [
      '-----BEGIN CERTIFICATE-----',
      node.textContent!.trim(),
      '-----END CERTIFICATE-----',
      '', // must end with newline
    ].join('\n')
  );

  const redirectBindingElement = select(
    `//md:SingleSignOnService[@Binding='${REDIRECT_BINDING}']`,
    doc,
    true
  ) as Element;

  const redirectUrl = redirectBindingElement.getAttribute('Location') || '';

  return {
    certificates,
    signRequests,
    loginUrl: redirectUrl,
    logoutUrl: redirectUrl,
  };
}
