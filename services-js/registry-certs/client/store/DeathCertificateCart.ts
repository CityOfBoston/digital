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
 * Labels and evidence copy follow Boston.gov “Evidence Required to Prove
 * Requester’s Legitimate Need” for SSN on death certificates.
 */
export const DEATH_RELATIONSHIP_OPTIONS = {
  spouse: {
    label: 'Spouse/Domestic Partner',
    requiredDocument:
      'Copy of your marriage certificate or registered domestic partnership listing the decedent',
  },
  parent: {
    label: 'Parent',
    requiredDocument:
      "A copy of your child's birth certificate listing you as the parent of the decedent",
  },
  legalGuardian: {
    label: 'Legal Guardian',
    requiredDocument: 'An original certified copy of your court appointment',
  },
  child: {
    label: 'Child',
    requiredDocument:
      'A copy of your birth certificate listing the decedent as your parent',
  },
  grandchild: {
    label: 'Grandchild',
    requiredDocument:
      "A copy of your birth certificate and your parent's birth certificate that lists the decedent as their parent",
  },
  grandparent: {
    label: 'Grandparent',
    requiredDocument:
      "A copy of your child's birth certificate that lists them as the parent and the deceased grandchild's birth certificate listing their child as the parent of the decedent",
  },
  sibling: {
    label: 'Sibling',
    requiredDocument:
      'A copy of your birth certificate that lists at least one common parent with the decedent and parents listed on the death record',
  },
  informant: {
    label: 'Informant',
    requiredDocument: 'Must be listed on the death record as the informant',
  },
  funeralDirector: {
    label: 'Funeral Director',
    requiredDocument:
      'Licensed in accordance with M.G.L c.112 & 83 who is listed on the death record',
  },
  legalConservator: {
    label: 'Legal Conservator',
    requiredDocument:
      "An original certified copy of your court appointment representing the decedent's estate",
  },
  legalRepresentative: {
    label: 'Legal Representative',
    requiredDocument:
      "An original or notarized copy of your employment representing the decedent's estate by the client and your bar card",
  },
  governmentOfficial: {
    label: 'Government Official',
    requiredDocument:
      'Agency photo ID; to fulfill an official government function',
  },
  courtOrder: {
    label: 'Person Identified through a Court Order',
    requiredDocument:
      'An original certified copy of your court document stating access to the record with full SSN',
  },
  other: {
    label: 'Other',
    requiredDocument:
      'At the discretion of the Registrar of Vital Records and Statistics or the local clerk where the death occurred',
  },
} as const;

/**
 * Preferred (List A) identity documents — one document required.
 * Shown in the main Proof of Identity native dropdown with “Other”.
 */
export const DEATH_IDENTITY_PREFERRED_OPTIONS = {
  'drivers-license': {
    label: "Driver's License",
    requiredDocument: "Front and back of your Driver's License",
  },
  'government-photo-id': {
    label: 'Government Issued Photo Identification Card',
    requiredDocument:
      'Front and back of your Government Issued Photo Identification Card',
  },
  passport: {
    label: 'Passport',
    requiredDocument: 'First page of your passport',
  },
  'military-id': {
    label: 'Military Identification Card',
    requiredDocument: 'Front and back of your Military Identification Card',
  },
} as const;

/**
 * Alternate (List B) identity documents — two documents required when
 * “Other” is selected on the main Proof of Identity dropdown.
 */
/**
 * `label` = simplified dropdown value.
 * `requiredDocument` = fuller copy shown after selection (and in the Other list).
 */
export const DEATH_IDENTITY_ALTERNATE_OPTIONS = {
  'utility-bills': {
    label: 'Utility Bills',
    requiredDocument: '2 Consecutive Utility Bills',
  },
  'social-security-card': {
    label: 'Social Security Card',
    requiredDocument: 'Social Security Card',
  },
  'pay-stub': {
    label: 'Pay Stub',
    requiredDocument: '1 Pay Stub',
  },
  'w2-form': {
    label: 'W-2 Form',
    requiredDocument: 'W-2 Form',
  },
  'insurance-card': {
    label: 'Insurance Card',
    requiredDocument: 'Insurance Card',
  },
  'school-id': {
    label: 'School Identification Card',
    requiredDocument: 'School Identification Card',
  },
  'bank-statement': {
    label: 'Bank Statement',
    requiredDocument: 'Bank Statement',
  },
  'expired-government-photo-id': {
    label: 'Expired Government Issued Photo ID',
    requiredDocument:
      'Expired Government Issued Photo ID (up to 2 years)',
  },
  'inmate-id': {
    label: 'Inmate ID',
    requiredDocument: 'Inmate ID (Inmate Paperwork)',
  },
  'state-benefits-card': {
    label: 'State-Issued Benefits Card',
    requiredDocument: 'State-Issued Benefits Card (SNAP/welfare)',
  },
} as const;

export const DEATH_IDENTITY_OTHER_REQUIRED_INTRO =
  'Provide two acceptable documents from the list below. Some document types may have additional requirements, such as two consecutive utility bills.';

/** Full required-document names for the Other intro bullet list. */
export const DEATH_IDENTITY_ALTERNATE_LABELS: string[] = (Object.keys(
  DEATH_IDENTITY_ALTERNATE_OPTIONS
) as Array<keyof typeof DEATH_IDENTITY_ALTERNATE_OPTIONS>).map(
  key => DEATH_IDENTITY_ALTERNATE_OPTIONS[key].requiredDocument
);

/** Main Proof of Identity dropdown values (preferred + Other). */
export const DEATH_IDENTITY_DOCUMENT_OPTIONS = {
  ...DEATH_IDENTITY_PREFERRED_OPTIONS,
  other: {
    label: 'Other',
    requiredDocument: DEATH_IDENTITY_OTHER_REQUIRED_INTRO,
  },
} as const;

export type DeathCertificateRelationship = keyof typeof DEATH_RELATIONSHIP_OPTIONS;
export type DeathCertificatePreferredIdentityDocumentType = keyof typeof DEATH_IDENTITY_PREFERRED_OPTIONS;
export type DeathCertificateAlternateIdentityDocumentType = keyof typeof DEATH_IDENTITY_ALTERNATE_OPTIONS;
export type DeathCertificateIdentityDocumentType =
  | keyof typeof DEATH_IDENTITY_DOCUMENT_OPTIONS
  | '';
export type DeathCertificateAlternateIdentitySelection =
  | DeathCertificateAlternateIdentityDocumentType
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

/** Options for the main Proof of Identity native dropdown. */
export function deathIdentityDocumentSelectOptions(): Array<{
  label: string;
  value: Exclude<DeathCertificateIdentityDocumentType, ''>;
}> {
  return (Object.keys(
    DEATH_IDENTITY_DOCUMENT_OPTIONS
  ) as Array<Exclude<DeathCertificateIdentityDocumentType, ''>>).map(value => ({
    value,
    label: DEATH_IDENTITY_DOCUMENT_OPTIONS[value].label,
  }));
}

/** Options for each alternate proof-of-identity dropdown under “Other”. */
export function deathIdentityAlternateSelectOptions(): Array<{
  label: string;
  value: DeathCertificateAlternateIdentityDocumentType;
}> {
  return (Object.keys(
    DEATH_IDENTITY_ALTERNATE_OPTIONS
  ) as DeathCertificateAlternateIdentityDocumentType[]).map(value => ({
    value,
    label: DEATH_IDENTITY_ALTERNATE_OPTIONS[value].label,
  }));
}

export function isDeathIdentityOther(
  type: DeathCertificateIdentityDocumentType
): boolean {
  return type === 'other';
}

export function deathIdentitySupportingDocumentsComplete(entry: {
  identityDocumentType: DeathCertificateIdentityDocumentType;
  identityAlternateDocumentType1?: DeathCertificateAlternateIdentitySelection;
  identityAlternateDocumentType2?: DeathCertificateAlternateIdentitySelection;
  identityDocuments: { status: string }[];
  identityDocumentsSecondary?: { status: string }[];
}): boolean {
  const {
    identityDocumentType,
    identityDocuments,
    identityDocumentsSecondary = [],
  } = entry;

  if (!identityDocumentType) {
    return false;
  }

  if (isDeathIdentityOther(identityDocumentType)) {
    return !!(
      entry.identityAlternateDocumentType1 &&
      entry.identityAlternateDocumentType2 &&
      entry.identityAlternateDocumentType1 !==
        entry.identityAlternateDocumentType2 &&
      identityDocuments.some(file => file.status === 'success') &&
      identityDocumentsSecondary.some(file => file.status === 'success')
    );
  }

  return identityDocuments.some(file => file.status === 'success');
}

export interface DeathCertificateItemOptions {
  includeSsn: boolean | null;
  relationship: DeathCertificateRelationship | '';
  identityDocumentType: DeathCertificateIdentityDocumentType;
  identityAlternateDocumentType1: DeathCertificateAlternateIdentitySelection;
  identityAlternateDocumentType2: DeathCertificateAlternateIdentitySelection;
  uploadSessionId: string;
  relationshipDocuments: UploadableFile[];
  identityDocuments: UploadableFile[];
  identityDocumentsSecondary: UploadableFile[];
}

interface LocalStorageEntry {
  id: string;
  quantity: number;
  includeSsn?: boolean | null;
  relationship?: DeathCertificateRelationship | '';
  identityDocumentType?: DeathCertificateIdentityDocumentType;
  identityAlternateDocumentType1?: DeathCertificateAlternateIdentitySelection;
  identityAlternateDocumentType2?: DeathCertificateAlternateIdentitySelection;
  uploadSessionId?: string;
  relationshipDocuments?: UploadableFileRecord[];
  identityDocuments?: UploadableFileRecord[];
  identityDocumentsSecondary?: UploadableFileRecord[];
}

/**
 * Attachment @label is a free-text description of the uploaded file (DB stores
 * it as-is; Registry may later standardize options). Birth uses values like
 * "id front" / "id back". Death has no separate document-type column, so we
 * encode relationship / identity context in the label for fulfillment review.
 *
 * Examples:
 *   "relationship:Spouse/Domestic Partner"
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
  identityDocumentType:
    | DeathCertificateIdentityDocumentType
    | DeathCertificateAlternateIdentitySelection
): string {
  if (
    identityDocumentType &&
    Object.prototype.hasOwnProperty.call(
      DEATH_IDENTITY_PREFERRED_OPTIONS,
      identityDocumentType
    )
  ) {
    return `identity:${
      DEATH_IDENTITY_PREFERRED_OPTIONS[
        identityDocumentType as DeathCertificatePreferredIdentityDocumentType
      ].label
    }`;
  }

  if (
    identityDocumentType &&
    Object.prototype.hasOwnProperty.call(
      DEATH_IDENTITY_ALTERNATE_OPTIONS,
      identityDocumentType
    )
  ) {
    return `identity:${
      DEATH_IDENTITY_ALTERNATE_OPTIONS[
        identityDocumentType as DeathCertificateAlternateIdentityDocumentType
      ].requiredDocument
    }`;
  }

  if (identityDocumentType === 'other') {
    return 'identity:Other';
  }

  return `identity:${identityDocumentType || 'unknown'}`;
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
  @observable
  identityAlternateDocumentType1: DeathCertificateAlternateIdentitySelection = '';
  @observable
  identityAlternateDocumentType2: DeathCertificateAlternateIdentitySelection = '';
  @observable uploadSessionId: string = '';
  @observable.ref relationshipDocuments: UploadableFile[] = [];
  /** Preferred identity uploads, or the first alternate upload when type is Other. */
  @observable.ref identityDocuments: UploadableFile[] = [];
  /** Second alternate identity upload when type is Other. */
  @observable.ref identityDocumentsSecondary: UploadableFile[] = [];
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
                  identityAlternateDocumentType1:
                    entry.identityAlternateDocumentType1,
                  identityAlternateDocumentType2:
                    entry.identityAlternateDocumentType2,
                  uploadSessionId: entry.uploadSessionId,
                  relationshipDocuments: entry.relationshipDocuments
                    .map(file => file.record)
                    .filter((r): r is UploadableFileRecord => !!r),
                  identityDocuments: entry.identityDocuments
                    .map(file => file.record)
                    .filter((r): r is UploadableFileRecord => !!r),
                  identityDocumentsSecondary: entry.identityDocumentsSecondary
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
    entry.relationship =
      saved.relationship && DEATH_RELATIONSHIP_OPTIONS[saved.relationship]
        ? saved.relationship
        : '';
    entry.identityDocumentType =
      saved.identityDocumentType &&
      DEATH_IDENTITY_DOCUMENT_OPTIONS[saved.identityDocumentType]
        ? saved.identityDocumentType
        : '';
    entry.identityAlternateDocumentType1 =
      saved.identityAlternateDocumentType1 &&
      DEATH_IDENTITY_ALTERNATE_OPTIONS[saved.identityAlternateDocumentType1]
        ? saved.identityAlternateDocumentType1
        : '';
    entry.identityAlternateDocumentType2 =
      saved.identityAlternateDocumentType2 &&
      DEATH_IDENTITY_ALTERNATE_OPTIONS[saved.identityAlternateDocumentType2]
        ? saved.identityAlternateDocumentType2
        : '';
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

    const primaryIdentityLabel = isDeathIdentityOther(entry.identityDocumentType)
      ? deathIdentityAttachmentLabel(entry.identityAlternateDocumentType1)
      : deathIdentityAttachmentLabel(entry.identityDocumentType);

    entry.identityDocuments = (saved.identityDocuments || []).map(rec =>
      UploadableFile.fromRecord(
        rec,
        entry.uploadSessionId,
        primaryIdentityLabel
      )
    );
    entry.identityDocumentsSecondary = (
      saved.identityDocumentsSecondary || []
    ).map(rec =>
      UploadableFile.fromRecord(
        rec,
        entry.uploadSessionId,
        deathIdentityAttachmentLabel(entry.identityAlternateDocumentType2)
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
    entry.identityAlternateDocumentType1 =
      options.identityAlternateDocumentType1;
    entry.identityAlternateDocumentType2 =
      options.identityAlternateDocumentType2;
    entry.uploadSessionId =
      options.uploadSessionId || createDeathCertificateUploadSessionId();
    entry.relationshipDocuments = options.relationshipDocuments;
    entry.identityDocuments = options.identityDocuments;
    entry.identityDocumentsSecondary = options.identityDocumentsSecondary;
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
