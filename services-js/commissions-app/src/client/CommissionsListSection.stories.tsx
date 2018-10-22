import React from 'react';
import { storiesOf } from '@storybook/react';
import CommissionsListSection, { Props } from './CommissionsListSection';
import { action } from '@storybook/addon-actions';

const COMMISSIONS = [
  {
    name: 'Trustees of Charitable Donations for Inhabitants of Boston',
    id: 1,
    openSeats: 12,
    homepageUrl:
      'https://www.boston.gov/departments/treasury/trustees-charitable-donations-inhabitants-boston',
  },
  {
    name: 'Boston School Committee Nominating Panel',
    id: 2,
    openSeats: 3,
    homepageUrl:
      'https://www.boston.gov/departments/schools/Boston-School-Committee-Nominating-Panel',
  },
  {
    name: 'Boston School Committee',
    id: 4,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/schools/Boston-School-Committee',
  },
  {
    name: 'Neighborhood Housing Trust Fund',
    id: 7,
    openSeats: 3,
    homepageUrl:
      'https://www.boston.gov/departments/treasury/Neighborhood-Housing-Trust-Fund',
  },
  {
    name: 'City of Boston School Trust Fund',
    id: 10,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/schools/city-boston-school-trust-fund',
  },
  {
    name: 'George Robert White Fund',
    id: 11,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/treasury/George-Robert-White-Fund',
  },
  {
    name: 'Fund for Parks & Recreation in Boston',
    id: 13,
    openSeats: 1,
    homepageUrl:
      'https://www.boston.gov/departments/parks-and-recreation/fund-parks-and-recreation-boston',
  },
  {
    name: 'Resident Advisory Board',
    id: 15,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/housing-authority/Resident-Advisory-Board',
  },
  {
    name: 'Boston Cultural Council',
    id: 16,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/arts-and-culture/Boston-Cultural-Council',
  },
  {
    name: 'Neighborhood Jobs Trust',
    id: 18,
    openSeats: 3,
    homepageUrl:
      'https://www.boston.gov/departments/economic-development/Neighborhood-Jobs-Trust',
  },
  {
    name: 'Zoning Commission',
    id: 21,
    openSeats: 4,
    homepageUrl:
      'https://www.boston.gov/departments/planning-development-agency/Zoning-Commission',
  },
  {
    name: 'Boston Fair Housing Commission',
    id: 25,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/fair-housing-and-equity/Boston-Fair-Housing-Commission',
  },
  {
    name: 'Boston Compensation Advisory Board',
    id: 28,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/licensing-board/Boston-Compensation-Advisory-Board',
  },
  {
    name: 'Mass. Water Resources Authority',
    id: 31,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/environment/mass-water-resources-authority',
  },
  {
    name: 'Board of Review--Assessing',
    id: 32,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/assessing/board-review-assessing',
  },
  {
    name: 'Air Pollution Control Commission',
    id: 34,
    openSeats: 1,
    homepageUrl:
      'https://www.boston.gov/departments/environment/Air-Pollution-Control-Commission',
  },
  {
    name: 'Archives and Records Advisory Commission',
    id: 35,
    openSeats: 1,
    homepageUrl:
      'https://www.boston.gov/departments/archives-and-records-management',
  },
  {
    name: 'Boston Art Commission',
    id: 36,
    openSeats: 2,
    homepageUrl:
      'https://www.boston.gov/departments/arts-and-culture/Boston-Art-Commission',
  },
  {
    name: 'Audit Committee of the City of Boston',
    id: 37,
    openSeats: 1,
    homepageUrl:
      'https://www.boston.gov/departments/auditing/audit-committee-city-boston',
  },
  {
    name: 'Back Bay Architectural Commission',
    id: 38,
    openSeats: 7,
    homepageUrl:
      'https://www.boston.gov/historic-district/back-bay-architectural-district',
  },
  {
    name:
      'Back Bay West/Bay State Road Architectural Conservation District Commission',
    id: 39,
    openSeats: 5,
    homepageUrl:
      'https://www.boston.gov/historic-district/bay-state-roadback-bay-west-area-architectural-conservation-district',
  },
  {
    name: 'Bay Village Historic District Commission',
    id: 40,
    openSeats: 4,
    homepageUrl:
      'https://www.boston.gov/historic-district/bay-village-historic-district',
  },
  {
    name: 'Beacon Hill Architectural Commission',
    id: 41,
    openSeats: 8,
    homepageUrl:
      'https://www.boston.gov/historic-district/historic-beacon-hill-district',
  },
  {
    name: 'Board of Examiners',
    id: 42,
    openSeats: 3,
    homepageUrl:
      'https://www.boston.gov/departments/inspectional-services/board-examiners',
  },
  {
    name: 'Boston Employment Commission',
    id: 43,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/small-business-development/boston-employment-commission',
  },
  {
    name: 'Boston Housing Authority Monitoring Committee',
    id: 44,
    openSeats: 9,
    homepageUrl:
      'https://www.boston.gov/departments/housing-authority/Boston-Housing-Authority-Monitoring-Committee',
  },
  {
    name: 'Boston Industrial Development Financing Authority',
    id: 45,
    openSeats: 3,
    homepageUrl:
      'https://www.boston.gov/departments/planning-development-agency/Boston-Industrial-Development-Financing-Authority',
  },
  {
    name: 'Boston Public Health Commission',
    id: 46,
    openSeats: 1,
    homepageUrl: 'https://www.boston.gov/departments/public-health-commission',
  },
  {
    name: 'Boston Public Library Board of Trustees',
    id: 47,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/library/boston-public-library-board-trustees',
  },
  {
    name:
      'Boston Redevelopment Authority (BRA)/Economic Development Industrial Corp (EDIC)',
    id: 48,
    openSeats: 2,
    homepageUrl:
      'https://www.boston.gov/departments/planning-development-agency',
  },
  {
    name: 'Edward Ingersoll Browne Trust Fund',
    id: 51,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/treasury/Edward-Ingersoll-Browne-Trust-Fund',
  },
  {
    name: 'Boston Elections Commission',
    id: 52,
    openSeats: 3,
    homepageUrl:
      'https://www.boston.gov/departments/election/Boston-Elections-Commission',
  },
  {
    name: 'Freedom Trail Commission',
    id: 53,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/public-works/Freedom-Trail-Commission',
  },
  {
    name: 'Parks & Recreation Commission',
    id: 55,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/parks-and-recreation/Parks-and-Recreation-Commission',
  },
  {
    name: 'Public Improvement Commission',
    id: 56,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/public-works/Public-Improvement-Commission',
  },
  {
    name: 'Licensing Board for the City of Boston',
    id: 59,
    openSeats: 0,
    homepageUrl: 'https://www.boston.gov/departments/licensing-board',
  },
  {
    name: 'Boston Conservation Commission',
    id: 60,
    openSeats: 1,
    homepageUrl:
      'https://www.boston.gov/departments/environment/conservation-commission',
  },
  {
    name: 'Boston Water and Sewer Commission',
    id: 64,
    openSeats: 1,
    homepageUrl:
      'https://www.boston.gov/departments/water-and-sewer-commission',
  },
  {
    name: 'Boston Landmarks Commission',
    id: 65,
    openSeats: 10,
    homepageUrl: 'https://www.boston.gov/departments/landmarks-commission',
  },
  {
    name:
      'Mission Hill Triangle Architectural Conservation District Commission',
    id: 66,
    openSeats: 7,
    homepageUrl:
      'https://www.boston.gov/historic-district/mission-hill-triangle',
  },
  {
    name: 'South End Landmark District Commission',
    id: 67,
    openSeats: 7,
    homepageUrl:
      'https://www.boston.gov/historic-district/south-end-landmark-district',
  },
  {
    name: 'St. Botolph Architectural Conservation District Commission',
    id: 68,
    openSeats: 5,
    homepageUrl: 'https://www.boston.gov/historic-district/saint-botolph',
  },
  {
    name: 'Boston Civic Design Commission',
    id: 69,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/planning-development-agency/Boston-Civic-Design-Commission',
  },
  {
    name: 'Fund for Boston Neighborhoods, Inc.',
    id: 84,
    openSeats: 5,
    homepageUrl:
      'https://www.boston.gov/departments/tourism-sports-and-entertainment/fund-boston-neighborhoods-inc',
  },
  {
    name: 'Public Facilities Commission',
    id: 85,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/public-facilities/Public-Facilities-Commission',
  },
  {
    name: 'Residency Compliance Commission',
    id: 86,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/property-management/Residency-Compliance-Commission',
  },
  {
    name: 'City of Boston Scholarship Fund',
    id: 87,
    openSeats: 1,
    homepageUrl:
      'https://www.boston.gov/departments/schools/city-boston-scholarship-fund',
  },
  {
    name: 'Boston Groundwater Trust',
    id: 157,
    openSeats: 1,
    homepageUrl:
      'https://www.boston.gov/departments/environment/Boston-Groundwater-Trust',
  },
  {
    name: 'Fort Point Channel Landmark District Commission',
    id: 162,
    openSeats: 6,
    homepageUrl: 'https://www.boston.gov/historic-district/fort-point-channel',
  },
  {
    name: 'Boston Disability Advisory Commission',
    id: 165,
    openSeats: 0,
    homepageUrl:
      'https://www.boston.gov/departments/disabilities-commission/disability-commission-advisory-board',
  },
  {
    name: 'Aberdeen Architectural Conservation District Commission',
    id: 170,
    openSeats: 7,
    homepageUrl:
      'https://www.boston.gov/historic-district/aberdeen-architectural-conservation-district',
  },
  {
    name: 'Boston Retirement Board',
    id: 171,
    openSeats: 0,
    homepageUrl: 'https://www.boston.gov/departments/retirement',
  },
  {
    name: 'Zoning Board of Appeals',
    id: 180,
    openSeats: 3,
    homepageUrl:
      'https://www.boston.gov/departments/inspectional-services/zoning-board-appeal',
  },
  {
    name: 'Trustee of the Copley Square Charitable Trust',
    id: 209,
    openSeats: 0,
    homepageUrl: null,
  },
  {
    name: 'Off-Street Parking Facilities Board',
    id: 210,
    openSeats: 3,
    homepageUrl:
      'https://www.boston.gov/departments/transportation/Off-Street-Parking-Facilities-Board',
  },
  {
    name: 'Living Wage Advisory Committee',
    id: 211,
    openSeats: 1,
    homepageUrl:
      'https://www.boston.gov/departments/labor-relations/living-wage-advisory-committee',
  },
  {
    name: 'Animal Control Commission',
    id: 212,
    openSeats: 9,
    homepageUrl:
      'https://www.boston.gov/departments/inspectional-services/animal-control-commission',
  },
  {
    name: 'Community Preservation Committee',
    id: 214,
    openSeats: 0,
    homepageUrl: 'https://www.boston.gov/community-preservation',
  },
];

const DEFAULT_PROPS: Props = {
  commissions: COMMISSIONS,
  selectedCommissionIds: ['2'],
  setSelectedIds: action('setSelected'),
};

storiesOf('CommissionsListSection', module)
  .addDecorator(story => <div className="b-c">{story()}</div>)
  .add('default', () => <CommissionsListSection {...DEFAULT_PROPS} />)
  .add('too many checked', () => (
    <CommissionsListSection
      {...DEFAULT_PROPS}
      selectedCommissionIds={['1', '2', '4', '7', '10', '171']}
      testExpanded
    />
  ))
  .add('no initial selections', () => (
    <CommissionsListSection {...DEFAULT_PROPS} selectedCommissionIds={[]} />
  ));
