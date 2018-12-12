import Open311, {
  Service,
  ServiceMetadata,
  CreateServiceRequestArgs,
  DetailedServiceRequest,
} from './Open311';

import SERVICES from './__fixtures__/open311/services.json';
import METADATA from './__fixtures__/open311/metadata';
import REQUEST from './__fixtures__/open311/request';

export default class Open311Fake implements Required<Open311> {
  public async services(): Promise<Service[]> {
    return SERVICES;
  }

  public async service(code: string): Promise<Service | null> {
    return (
      (await this.services()).find(({ service_code: c }) => c === code) || null
    );
  }

  public async serviceMetadata(code: string): Promise<ServiceMetadata> {
    return (
      METADATA.find(({ service_code }) => service_code === code) || METADATA[0]
    );
  }

  public async request(_id: string): Promise<DetailedServiceRequest | null> {
    return REQUEST;
  }

  public async createRequest(
    args: CreateServiceRequestArgs
  ): Promise<DetailedServiceRequest> {
    const service = await this.service(args.service_code);

    const out: DetailedServiceRequest = {
      id: '200123456',
      service_request_id: '200123456',
      status: 'open',

      service_code: args.service_code,
      service_name: service && service.service_name,

      address_id: args.address_id || null,
      attributes: args.attributes,
      description: args.description,

      address: args.address_string || null,
      address_details: args.address_string || null,
      lat: args.lat || null,
      long: args.long || null,
      zipcode: '02108',

      reported_location: {
        address: args.address_string || null,
        address_id: args.address_id || null,
        lat: args.lat || null,
        long: args.long || null,
      },

      media_url: args.media_url || null,

      contact: {
        first_name: args.first_name || null,
        last_name: args.last_name || null,
        email: args.email || null,
        phone: args.phone || null,
      },

      requested_datetime: '2018-12-10T18:55:58.732Z',
      updated_datetime: '2018-12-10T18:55:58.732Z',
      expected_datetime: null,

      parent_service_request_id: null,
      duplicate_parent_service_request_id: null,

      origin: null,
      source: null,
      priority: '',
      owner: null,
      agency_responsible: null,
      service_notice: null,
      service_level_agreement: null,
      events: [],
      activities: [],

      status_notes: '',
      closure_details: {
        comment: null,
        reason: null,
      },
    };
    return out;
  }
}
