export interface InfoResponse {
  employeeId: string;
  accountTools: Array<{
    name: string;
    url: string;
  }>;
}
