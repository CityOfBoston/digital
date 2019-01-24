import RegistryDb, {
  DeathCertificateSearchResult,
  DeathCertificate,
  FindOrderResult,
} from './RegistryDb';

export default class RegistryDbFake implements Required<RegistryDb> {
  deathCertificates: Array<DeathCertificateSearchResult>;

  constructor(deathCertificates: Array<DeathCertificateSearchResult>) {
    this.deathCertificates = deathCertificates;
  }

  async searchDeathCertificates(
    _query: string,
    page: number,
    pageSize: number
  ): Promise<Array<DeathCertificateSearchResult>> {
    return this.deathCertificates.slice(page * pageSize, (page + 1) * pageSize);
  }

  async lookupDeathCertificate(id: string): Promise<DeathCertificate | null> {
    return this.deathCertificates.find(
      res => res.CertificateID.toString() === id
    )!;
  }

  async addOrder(): Promise<number> {
    return 50;
  }

  async addDeathCertificateItem(): Promise<void> {}
  async addBirthCertificateRequest(): Promise<number> {
    return 105;
  }
  async addPayment(): Promise<void> {}

  async findOrder(): Promise<FindOrderResult | null> {
    const orderFixture = require('../../fixtures/registry-orders/order.json');
    return orderFixture;
  }

  async cancelOrder(): Promise<void> {}
}
