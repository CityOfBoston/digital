/* tslint:disable */
//  This file was automatically generated and should not be edited.

export interface FetchAccountAndAppsQuery {
  account: {
    employeeId: string;
  };
  apps: {
    categories: Array<{
      title: string;
      showIcons: boolean;
      requestAccessUrl: string | null;
      apps: Array<{
        title: string;
        url: string;
        iconUrl: string | null;
        description: string;
      }>;
    }>;
  };
}

export interface FetchAccountQuery {
  account: {
    employeeId: string;
  };
}
