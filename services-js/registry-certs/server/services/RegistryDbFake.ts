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

  async addItem(): Promise<void> {}
  async addPayment(): Promise<void> {}

  async findOrder(): Promise<FindOrderResult | null> {
    const orderFixture = require('../../fixtures/registry-orders/order.json');
    return orderFixture;
  }

  async cancelOrder(): Promise<void> {}

  async searchBirthCertificates(firstName: string): Promise<Array<number>> {
    const count = firstName.match(/\d+/) ? parseInt(firstName, 10) : 1;

    const out: number[] = [];
    for (let i = 0; i < count; ++i) {
      out.push(i + 244000);
    }

    return out;
  }
}
