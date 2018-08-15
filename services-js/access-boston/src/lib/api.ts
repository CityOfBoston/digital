export interface InfoResponse {
  employeeId: string;
  requestAccessUrl: string;
  categories: Array<{
    title: string;
    showRequestAccessLink: boolean;
    icons: boolean;
    apps: Array<{
      title: string;
      url: string;
      iconUrl?: string;
      description: string;
    }>;
  }>;
}
