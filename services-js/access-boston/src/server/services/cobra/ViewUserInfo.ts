import CobraClient from './CobraClient';

export interface ViewUserInfoArgs {
  query_string: string;
}

export interface CobraAttributes {
  uid: string;
  samaccountname: string;
  firstname: string;
  lastname: string;
  middleName?: string;
  preferredFirstName?: string;
  preferredLastName?: string;
  email: string;
  personalEmail?: string;
  managerEmail?: string;
  managerName?: string;
  departmentName?: string;
  location?: string;
  status: string;
  identityState: string;
  cloudStatus: string;
  isRegistered: string;
  isEmployee: string;
  passwordExpireDate?: string;
  workPhone?: string;
  phone?: string;
  hireDate?: string;
  displayName?: string;
  vpnStatus?: boolean;
  endDate?: string;
  isSponsor?: string;
  isVip?: string;
  [key: string]: any;
}

export interface CobraViewUserInfoResponse {
  attributes: CobraAttributes;
  access: string[];
}

export interface Account {
  name: string;
  disabled: boolean;
}

export interface ViewUserInfoResponse {
  id: string;
  uid: string;
  legalFirstName: string;
  legalLastName: string;
  middleName?: string;
  preferredFirstName?: string;
  preferredLastName?: string;
  displayName?: string;
  email: string;
  personalEmail?: string;
  workPhone?: string;
  phone?: string;
  manager?: string;
  departmentName?: string;
  location?: string;
  employmentStatus?: string;
  accountStatus?: string;
  identityState?: string;
  vpnStatus?: string;
  userRegistered?: string;
  passwordExpiresOn?: string;
  hireDate?: string;
  startDate?: string;
  isManager?: string;
  positionNumber?: string;
  jobCode?: string;
  isVip?: string;
  accounts: Account[];
  isEmployee: boolean;
  endDate?: string | null;
  sponsor?: string;
}

export default class ViewUserInfo {
  private client: CobraClient;

  constructor(client: CobraClient) {
    this.client = client;
  }

  async process(args: ViewUserInfoArgs): Promise<ViewUserInfoResponse[]> {
    try {
      console.log('[ViewUserInfo.process] Calling CobraClient.viewUserInfo with search term:', args.query_string);
      // Cobra API now expects 'id_or_displayname' parameter and returns an array
      const response = await this.client.viewUserInfo({ id_or_displayname: args.query_string });
      console.log('[ViewUserInfo.process] Received response with', Array.isArray(response) ? response.length : 0, 'items');
      
      // Validate response structure - now expecting an array
      if (!response || !Array.isArray(response)) {
        console.error('[ViewUserInfo.process] Invalid response structure - expected array, got:', typeof response);
        throw new Error('Invalid response structure from Cobra API - expected array');
      }
      
      // Transform each result in the array, handling errors gracefully
      const results: ViewUserInfoResponse[] = [];
      response.forEach((item: CobraViewUserInfoResponse, index: number) => {
        try {
          if (!item.attributes) {
            console.error(`[ViewUserInfo.process] Item ${index} missing attributes, skipping`);
            return;
          }
          const transformed = this.transformResponse(item, index);
          results.push(transformed);
        } catch (itemError) {
          console.error(`[ViewUserInfo.process] Error transforming item ${index}:`, {
            error: itemError instanceof Error ? itemError.message : 'Unknown error',
            stack: itemError instanceof Error ? itemError.stack : undefined,
            itemSample: JSON.stringify(item).substring(0, 200)
          });
          // Continue processing other items instead of failing completely
        }
      });

      if (results.length === 0 && response.length > 0) {
        console.error('[ViewUserInfo.process] All items failed to transform');
        throw new Error('Failed to transform any response items');
      }

      console.log('[ViewUserInfo.process] Successfully transformed', results.length, 'items');
      return results;
    } catch (err) {
      console.error('[ViewUserInfo.process] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        query_string: args.query_string,
        error: err
      });
      throw new Error(
        err instanceof Error ? err.message : 'Failed to get user info'
      );
    }
  }

  private transformResponse(
    cobraData: CobraViewUserInfoResponse,
    index?: number
  ): ViewUserInfoResponse {
    const attrs = cobraData.attributes;
    const itemLabel = index !== undefined ? `item ${index}` : 'item';

    // Validate required fields - throw only for truly critical missing data
    if (!attrs.uid) {
      throw new Error(`Missing required field: uid in ${itemLabel}`);
    }
    if (!attrs.firstname) {
      throw new Error(`Missing required field: firstname in ${itemLabel}`);
    }
    if (!attrs.lastname) {
      throw new Error(`Missing required field: lastname in ${itemLabel}`);
    }
    if (!attrs.email) {
      throw new Error(`Missing required field: email in ${itemLabel}`);
    }

    // Helper function to safely parse fields
    const safeGet = (fieldName: string, getValue: () => any, fallback: any = undefined) => {
      try {
        const value = getValue();
        return value !== undefined ? value : fallback;
      } catch (error) {
        console.warn(`[ViewUserInfo.transformResponse] Error parsing ${fieldName} for ${itemLabel}:`, error instanceof Error ? error.message : 'Unknown error');
        return fallback;
      }
    };

    // Parse accounts with error handling
    let accounts: Account[] = [];
    try {
      accounts = this.parseAccounts(cobraData.access || []);
    } catch (error) {
      console.error(`[ViewUserInfo.transformResponse] Error parsing accounts for ${itemLabel}:`, error instanceof Error ? error.message : 'Unknown error');
      accounts = [];
    }

    // Helper to convert undefined to null for GraphQL (allowUndefinedInResolve: false requires this)
    const toNullable = (value: any) => value !== undefined ? value : null;

    return {
      id: attrs.cloudAuthoritativeSource || attrs.uid,
      uid: attrs.uid,
      legalFirstName: attrs.firstname,
      legalLastName: attrs.lastname,
      middleName: toNullable(attrs.middleName),
      preferredFirstName: toNullable(attrs.preferredFirstName),
      preferredLastName: toNullable(attrs.preferredLastName),
      displayName: toNullable(attrs.displayName),
      email: attrs.email,
      personalEmail: toNullable(attrs.personalEmail),
      workPhone: toNullable(attrs.workPhone),
      phone: toNullable(attrs.phone),
      manager: toNullable(safeGet('manager', () => attrs.managerName || attrs.managerEmail, null)),
      departmentName: toNullable(attrs.departmentName),
      location: toNullable(attrs.location),
      employmentStatus: toNullable(safeGet('employmentStatus', () => 
        attrs.status === 'A' ? 'ACTIVE' : attrs.status || 'UNKNOWN', 
        'UNKNOWN'
      )),
      accountStatus: toNullable(safeGet('accountStatus', () => 
        attrs.cloudStatus === 'ACTIVE' ? 'Active' : 'Inactive',
        attrs.cloudStatus || 'Unknown'
      )),
      identityState: toNullable(attrs.identityState),
      vpnStatus: toNullable(safeGet('vpnStatus', () => {
        // Handle boolean or string values - use any to handle runtime types
        const vpn: any = attrs.vpnStatus;
        if (typeof vpn === 'boolean') {
          return vpn ? 'true' : 'false';
        }
        if (typeof vpn === 'string') {
          const lower = vpn.toLowerCase();
          if (lower === 'true' || lower === 'false') return lower;
        }
        return 'false'; // Default to false if undefined or invalid
      }, 'false')),
      userRegistered: toNullable(attrs.isRegistered),
      passwordExpiresOn: toNullable(attrs.passwordExpireDate),
      hireDate: toNullable(attrs.hireDate),
      startDate: toNullable(attrs.startDate),
      isManager: toNullable(attrs.isManager),
      positionNumber: toNullable(attrs.positionNumber),
      jobCode: toNullable(attrs.jobCode),
      isVip: toNullable(safeGet('isVip', () => attrs.isVip === 'true' ? 'Yes' : null, null)),
      isEmployee: safeGet('isEmployee', () => attrs.isEmployee === 'true', false),
      endDate: attrs.endDate || null,
      sponsor: toNullable(safeGet('sponsor', () => attrs.isSponsor === 'true' ? 'Yes' : null, null)),
      accounts: accounts,
    };
  }

  private parseAccounts(access: string[]): Account[] {
    if (!Array.isArray(access)) {
      console.warn('[ViewUserInfo.parseAccounts] Access is not an array:', typeof access);
      return [];
    }

    const results: Account[] = [];
    access.forEach((accessString, index) => {
      try {
        if (typeof accessString !== 'string') {
          console.warn(`[ViewUserInfo.parseAccounts] Item ${index} is not a string:`, typeof accessString);
          return;
        }

        // Extract name and status from "App Name (Enabled/Disabled)"
        const match = accessString.match(/^(.+?)\s*\((Enabled|Disabled)\)$/);
        let account: Account;
        
        if (match) {
          account = {
            name: match[1].trim(),
            disabled: match[2] === 'Disabled',
          };
        } else {
          account = { name: accessString, disabled: false };
        }

        // Skip excluded accounts
        if (this.shouldExcludeAccount(account.name)) {
          return;
        }

        // Format the account name
        account.name = this.formatAccountName(account.name);
        results.push(account);
      } catch (error) {
        console.error(`[ViewUserInfo.parseAccounts] Error parsing account ${index}:`, error instanceof Error ? error.message : 'Unknown error', 'Value:', accessString);
        // Continue processing other accounts
      }
    });

    return results;
  }

  private shouldExcludeAccount(name: string): boolean {
    if (!name) return false;
    if (name === 'IdentityNow') return true;
    if (name.includes('PSHcmJdbc')) return true;
    if (name.includes('Strivacity')) return true;
    return false;
  }

  private formatAccountName(name: string): string {
    if (!name) return '';
    if (name.includes('IAMDIR')) return 'Central Identity Directory';
    if (name === 'WebEx Control Hub - Service App') return 'WebEx Hub';
    if (name.includes('PSHcmUserProfile')) return 'Employee Self Service';
    return name;
  }
}

