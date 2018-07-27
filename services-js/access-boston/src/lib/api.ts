export interface InfoResponse {
  employeeId: string;
  accountTools: Array<{
    name: string;
    url: string;
  }>;
  requestAccessUrl: string;
  categories: Array<{
    title: string;
    apps: Array<{
      title: string;
      url: string;
      description: string;
    }>;
  }>;
}
