import soap from 'soap';

export type SoapCallback<T> = (
  err: Error | undefined,
  result: T,
  raw: any,
  soapHeader: Object
) => void;

export async function createSoapClient<C>(endpoint: string): Promise<C> {
  const wsdlUrl = `${endpoint}?WSDL`;

  const options = {
    disableCache: true,
    connection: 'keep-alive',
  };

  const client: C = await soap.createClientAsync(wsdlUrl, options);
  return client;
}
