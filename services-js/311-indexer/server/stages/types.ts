import { DetailedServiceRequest } from '../services/Open311';

export interface UpdatedCaseNotificationRecord {
  id: string;
  replayId: number | null;
}

export interface HydratedCaseRecord {
  id: string;

  case: DetailedServiceRequest | null;
  replayId: number | null;
}
