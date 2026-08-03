import { observable, computed, action, autorun } from 'mobx';
import uuidv4 from 'uuid/v4';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import { DeathCertificate } from '../types';
import DeathCertificatesDao from '../dao/DeathCertificatesDao';
import UploadableFile, { UploadableFileRecord } from '../models/UploadableFile';

import { CERTIFICATE_COST } from '../../lib/costs';

const DEATH_CERTIFICATE_COST = CERTIFICATE_COST.DEATH;

type CardTypes = '-1' | '0' | '1';

/**
 * Source of truth for selectable relationships + dynamic required-document copy.
 * Keys are the values submitted / stored on the cart line item.
 */
export const DEATH_RELATIONSHIP_OPTIONS = {
  spouse: {
    label: 'Spouse / Domestic Partner',
    requiredDocument:
      'Marriage certificate or registered domestic partnership record that lists the decedent.',
  },
  child: {
    label: 'Child',
    requiredDocument:
      'Birth certificate listing you and the decedent, or other proof of parent/child relationship.',
  },
  parent: {
    label: 'Parent',
    requiredDocument:
      'Birth certificate listing you and the decedent, or other proof of parent/child relationship.',
  },
  familyMember: {
    label: 'Other Family Member',
    requiredDocument: 'Proof of your family relationship to the decedent.',
  },
  friend: {
    label: 'Friend',
    requiredDocument:
      'Documentation showing your authority to request this certificate.',
  },
  client: {
    label: 'Client (Attorney / Authorized)',
    requiredDocument:
      'Documentation showing your legal authority to request this certificate.',
  },
  other: {
    label: 'Other',
    requiredDocument:
      'Documentation showing your relationship or authority to request this certificate.',
  },
} as const;

/**
 * Source of truth for selectable identity document types + dynamic required-document copy.
 */
export const DEATH_IDENTITY_DOCUMENT_OPTIONS = {
  'drivers-license': {
    label: "Driver's License",
    requiredDocument:
      'Upload clear images of the front and back of your driver’s license.',
  },
  'state-id': {
    label: 'State ID',
    requiredDocument:
      'Upload clear images of the front and back of your state ID.',
  },
  passport: {
    label: 'Passport',
    requiredDocument: 'Upload a clear image of your passport.',
  },
  'military-id': {
    label: 'Military ID',
    requiredDocument: 'Upload clear images of your military ID.',
  },
  other: {
    label: 'Other',
    requiredDocument:
      'Upload clear images of an accepted government-issued photo ID.',
  },
} as const;

export type DeathCertificateRelationship = keyof typeof DEATH_RELATIONSHIP_OPTIONS;
export type DeathCertificateIdentityDocumentType =
  | keyof typeof DEATH_IDENTITY_DOCUMENT_OPTIONS
  | '';

/** @deprecated Prefer DEATH_RELATIONSHIP_OPTIONS[key].label */
export const DEATH_RELATIONSHIP_LABELS: {
  [K in DeathCertificateRelationship]: string;
} = (Object.keys(DEATH_RELATIONSHIP_OPTIONS) as DeathCertificateRelationship[]).reduce(
  (acc, key) => {
    acc[key] = DEATH_RELATIONSHIP_OPTIONS[key].label;
    return acc;
  },
  {} as { [K in DeathCertificateRelationship]: string }
);

/** @deprecated Prefer DEATH_IDENTITY_DOCUMENT_OPTIONS[key].label */
export const DEATH_IDENTITY_DOCUMENT_LABELS: {
  [K in Exclude<DeathCertificateIdentityDocumentType, ''>]: string;
} = (Object.keys(
  DEATH_IDENTITY_DOCUMENT_OPTIONS
) as Array<Exclude<DeathCertificateIdentityDocumentType, ''>>).reduce(
  (acc, key) => {
    acc[key] = DEATH_IDENTITY_DOCUMENT_OPTIONS[key].label;
    return acc;
  },
  {} as {
    [K in Exclude<DeathCertificateIdentityDocumentType, ''>]: string;
  }
);

export function deathRelationshipSelectOptions(): Array<{
  label: string;
  value: DeathCertificateRelationship;
}> {
  return (Object.keys(
    DEATH_RELATIONSHIP_OPTIONS
  ) as DeathCertificateRelationship[]).map(value => ({
    value,
    label: DEATH_RELATIONSHIP_OPTIONS[value].label,
  }));
}

export function deathIdentityDocumentSelectOptions(): Array<{
  label: string;
  value: Exclude<DeathCertificateIdentityDocumentType, ''>;
}> {
  return (Object.keys(DEATH_IDENTITY_DOCUMENT_OPTIONS) as Array<
    Exclude<DeathCertificateIdentityDocumentType, ''>
  >).map(value => ({
    value,
    label: DEATH_IDENTITY_DOCUMENT_OPTIONS[value].label,
  }));
}

export interface DeathCertificateItemOptions {
  includeSsn: boolean | null;
  relationship: DeathCertificateRelationship | '';
  identityDocumentType: DeathCertificateIdentityDocumentType;
  uploadSessionId: string;
  relationshipDocuments: UploadableFile[];
  identityDocuments: UploadableFile[];
}

interface LocalStorageEntry {
  id: string;
  quantity: number;
  includeSsn?: boolean | null;
  relationship?: DeathCertificateRelationship | '';
  identityDocumentType?: DeathCertificateIdentityDocumentType;
  uploadSessionId?: string;
  relationshipDocuments?: UploadableFileRecord[];
  identityDocuments?: UploadableFileRecord[];
}

/**
 * Attachment @label is a free-text description of the uploaded file (DB stores
 * it as-is; Registry may later standardize options). Birth uses values like
 * "id front" / "id back". Death has no separate document-type column, so we
 * encode relationship / identity context in the label for fulfillment review.
 *
 * Examples:
 *   "relationship:Spouse / Domestic Partner"
 *   "identity:Driver's License"
 */
export function deathRelationshipAttachmentLabel(
  relationship: DeathCertificateRelationship | ''
): string {
  const relationshipLabel =
    relationship && DEATH_RELATIONSHIP_OPTIONS[relationship]
      ? DEATH_RELATIONSHIP_OPTIONS[relationship].label
      : relationship || 'unknown';
  return `relationship:${relationshipLabel}`;
}

export function deathIdentityAttachmentLabel(
  identityDocumentType: DeathCertificateIdentityDocumentType
): string {
  const typeLabel =
    identityDocumentType && DEATH_IDENTITY_DOCUMENT_OPTIONS[identityDocumentType]
      ? DEATH_IDENTITY_DOCUMENT_OPTIONS[identityDocumentType].label
      : identityDocumentType || 'unknown';
  return `identity:${typeLabel}`;
}

export function createDeathCertificateUploadSessionId(): string {
  return uuidv4();
}

export class DeathCertificateCartEntry {
  id: string = '';
  @observable.ref cert: DeathCertificate | null = null;
  @observable quantity: number = 0;

  /** null = not answered yet (should not appear on submitted cart lines). */
  @observable includeSsn: boolean | null = null;
  @observable relationship: DeathCertificateRelationship | '' = '';
  @observable identityDocumentType: DeathCertificateIdentityDocumentType = '';
  @observable uploadSessionId: string = '';
  @observable.ref relationshipDocuments: UploadableFile[] = [];
  @observable.ref identityDocuments: UploadableFile[] = [];
}

export default class DeathCertificateCart {
  @observable entries: Array<DeathCertificateCartEntry> = [];
  @observable pendingFetches: number = 0;
  @observable cardType: CardTypes = '-1'; // -1 = NaN, 0 = CREDIT, 1 = DEBIT

  localStorageDisposer: Function | null = null;
  siteAnalytics: GaSiteAnalytics | null = null;

  @action
  attach(
    localStorage: Storage | null,
    deathCertificatesDao: DeathCertificatesDao,
    siteAnalytics: GaSiteAnalytics
  ) {
    this.siteAnalytics = siteAnalytics;

    if (localStorage) {
      try {
        const savedCart: Array<LocalStorageEntry> = JSON.parse(
          localStorage.getItem('cart') || '[]'
        );

        this.cardType = '-1';

        this.entries = savedCart
          .filter(({ quantity }) => quantity > 0)
          .map(
            action(
              'hydrate entry from local storage start',
              (saved: LocalStorageEntry) => {
                const entry = this.createEntryFromStorage(saved);

                this.pendingFetches += 1;

                deathCertificatesDao.get(saved.id).then(
                  action(
                    'hydrate item from local storage complete',
                    (cert: DeathCertificate | null) => {
                      if (cert) {
                        entry.cert = cert;
                      } else {
                        this.remove(saved.id);
                      }
                      this.pendingFetches -= 1;
                    }
                  )
                );

                return entry;
              }
            )
          );
      } catch (e) {
        localStorage.removeItem('cart');
      }

      this.localStorageDisposer = autorun(
        () => {
          localStorage.setItem(
            'cart',
            JSON.stringify(
              this.entries.map(
                (entry): LocalStorageEntry => ({
                  id: entry.id,
                  quantity: entry.quantity,
                  includeSsn: entry.includeSsn,
                  relationship: entry.relationship,
                  identityDocumentType: entry.identityDocumentType,
                  uploadSessionId: entry.uploadSessionId,
                  relationshipDocuments: entry.relationshipDocuments
                    .map(file => file.record)
                    .filter((r): r is UploadableFileRecord => !!r),
                  identityDocuments: entry.identityDocuments
                    .map(file => file.record)
                    .filter((r): r is UploadableFileRecord => !!r),
                })
              )
            )
          );
        },
        {
          name: 'save cart to local storage',
        }
      );
    }
  }

  private createEntryFromStorage(
    saved: LocalStorageEntry
  ): DeathCertificateCartEntry {
    const entry = new DeathCertificateCartEntry();
    entry.id = saved.id;
    entry.cert = null;
    entry.quantity = saved.quantity;
    entry.includeSsn =
      typeof saved.includeSsn === 'boolean' ? saved.includeSsn : null;
    entry.relationship = saved.relationship || '';
    entry.identityDocumentType = saved.identityDocumentType || '';
    entry.uploadSessionId =
      saved.uploadSessionId || createDeathCertificateUploadSessionId();

    entry.relationshipDocuments = (saved.relationshipDocuments || []).map(
      rec =>
        UploadableFile.fromRecord(
          rec,
          entry.uploadSessionId,
          deathRelationshipAttachmentLabel(entry.relationship)
        )
    );
    entry.identityDocuments = (saved.identityDocuments || []).map(rec =>
      UploadableFile.fromRecord(
        rec,
        entry.uploadSessionId,
        deathIdentityAttachmentLabel(entry.identityDocumentType)
      )
    );

    return entry;
  }

  @action
  detach() {
    if (this.localStorageDisposer) {
      this.localStorageDisposer();
      this.localStorageDisposer = null;
    }

    this.siteAnalytics = null;
  }

  trackCartItems() {
    const { siteAnalytics } = this;

    if (!siteAnalytics) {
      return;
    }

    this.entries.forEach(({ id, quantity }) => {
      siteAnalytics.addProduct(
        id,
        'Death certificate',
        'Death certificate',
        quantity,
        DEATH_CERTIFICATE_COST / 100
      );
    });
  }

  @computed
  get size(): number {
    // quantity shouldn't be below 0 but we want to be defensive.
    return this.entries.reduce(
      (acc, item) => acc + Math.max(item.quantity, 0),
      0
    );
  }

  @computed
  get loading(): boolean {
    return this.pendingFetches > 0;
  }

  @action
  setCardType(type: '-1' | '0' | '1'): void {
    if (this && this.cardType) this.cardType = type;
  }

  getEntry(certId: string): DeathCertificateCartEntry | undefined {
    return this.entries.find(({ id }) => id === certId);
  }

  @action
  setQuantity(cert: DeathCertificate, quantity: number) {
    const { siteAnalytics } = this;

    const existingItem = this.entries.find(({ id }) => id === cert.id);
    const filteredQuantity = Math.max(0, Math.min(99, quantity));

    const quantityChange = quantity - this.getQuantity(cert.id);

    if (siteAnalytics) {
      siteAnalytics.addProduct(
        cert.id,
        'Death certificate',
        'Death certificate',
        Math.abs(quantityChange),
        DEATH_CERTIFICATE_COST / 100
      );
      siteAnalytics.setProductAction(quantityChange < 0 ? 'remove' : 'add');
    }

    if (existingItem) {
      // We don't remove items here when their quantity is 0 so that they don't
      // disappear when you edit the values on the cart page.
      existingItem.quantity = filteredQuantity;
    } else {
      const item = new DeathCertificateCartEntry();
      item.id = cert.id;
      item.cert = cert;
      item.quantity = filteredQuantity;
      item.uploadSessionId = createDeathCertificateUploadSessionId();

      this.entries.push(item);
    }
  }

  /**
   * Adds or updates a cart line with STEP 3 certificate options.
   * Each line item gets its own uploadSessionId for attachment association.
   */
  @action
  setCertificateOptions(
    cert: DeathCertificate,
    quantity: number,
    options: DeathCertificateItemOptions
  ) {
    this.setQuantity(cert, quantity);

    const entry = this.entries.find(({ id }) => id === cert.id);

    if (!entry) {
      return;
    }

    entry.includeSsn = options.includeSsn;
    entry.relationship = options.relationship;
    entry.identityDocumentType = options.identityDocumentType;
    entry.uploadSessionId =
      options.uploadSessionId || createDeathCertificateUploadSessionId();
    entry.relationshipDocuments = options.relationshipDocuments;
    entry.identityDocuments = options.identityDocuments;
  }

  @action
  remove(certId: string) {
    const { siteAnalytics } = this;
    const idx = this.entries.findIndex(({ id }) => id === certId);

    if (idx !== -1) {
      if (siteAnalytics) {
        siteAnalytics.addProduct(
          certId,
          'Death certificate',
          'Death certificate',
          this.getQuantity(certId),
          DEATH_CERTIFICATE_COST / 100
        );
        siteAnalytics.setProductAction('remove');
      }

      this.entries.splice(idx, 1);
    }
  }

  getCardType() {
    let retVal: CardTypes = '0';
    if (this && this.cardType) retVal = this.cardType;
    return retVal;
  }

  getQuantity(certId: string): number {
    const entry = this.entries.find(({ id }) => id === certId);

    if (entry) {
      return entry.quantity;
    } else {
      return 0;
    }
  }

  @action
  clean() {
    this.entries = this.entries.filter(({ quantity }) => quantity > 0);
  }

  @action
  clear() {
    this.entries = [];
  }

  @computed
  get containsPending(): boolean {
    return !!this.entries.find(({ cert }) => !!(cert && cert.pending));
  }
}
