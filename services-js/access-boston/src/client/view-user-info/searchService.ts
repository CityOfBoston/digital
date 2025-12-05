import { Identity } from './types';

// NOTE: This dummy data is temporary. In the future, this will be replaced
// with GraphQL/Cobra API calls to fetch real user data.

const dummyData: Identity[] = [
  {
    id: "d4107a566e7b426b9207e793c3f23b75",
    uid: "000648",
    legalFirstName: "Sarah",
    legalLastName: "Chen",
    email: "sarah.chen@boston.gov",
    personalEmail: "sarah.chen@gmail.com",
    manager: "Michael Rodriguez",
    departmentName: "Security",
    location: "Boston HQ",
    employmentStatus: "ACTIVE",
    accountStatus: "ACTIVE",
    vpnStatus: "Active",
    userRegistered: "true",
    passwordExpiresOn: "2025-12-15",
    accounts: [
      { name: "COB-Application-PSHcmJdbc", disabled: false },
      { name: "IdentityNow", disabled: false },
    ],
    isEmployee: true,
    endDate: null,
  },
  {
    id: "e5107a566e7b426b9207e793c3f23b76",
    uid: "000649",
    legalFirstName: "James",
    legalLastName: "Martinez",
    email: "james.martinez@boston.gov",
    personalEmail: "james.martinez@gmail.com",
    manager: "Patricia Williams",
    departmentName: "Research",
    location: "Boston City Hall",
    employmentStatus: "ACTIVE",
    accountStatus: "UNREGISTERED",
    vpnStatus: "Inactive",
    userRegistered: "false",
    passwordExpiresOn: "2025-11-20",
    accounts: [
      { name: "COB-Application-CityHall", disabled: true },
      { name: "COB-Application-IAMDIR", disabled: true },
      { name: "WebEx Control Hub - Service App", disabled: false },
      { name: "PSHcmUserProfile", disabled: false },
      { name: "Strivacity App", disabled: false },
    ],
    isEmployee: false,
    endDate: "2025-12-31",
    sponsor: "Jennifer Davis",
  },
  {
    id: "f6107a566e7b426b9207e793c3f23b77",
    uid: "000650",
    legalFirstName: "Emily",
    legalLastName: "Thompson",
    email: "emily.thompson@boston.gov",
    personalEmail: "emily.thompson@gmail.com",
    manager: "Robert Anderson",
    departmentName: "Communications",
    location: "Downtown Office",
    employmentStatus: "ACTIVE",
    accountStatus: "ACTIVE",
    vpnStatus: "Active",
    userRegistered: "true",
    passwordExpiresOn: "2025-12-05",
    accounts: [
      { name: "COB-Application-PSHcmJdbc", disabled: false },
      { name: "IdentityNow", disabled: false },
    ],
  },
  {
    id: "g7107a566e7b426b9207e793c3f23b78",
    uid: "000651",
    legalFirstName: "David",
    legalLastName: "Wilson",
    email: "david.wilson@boston.gov",
    personalEmail: "david.wilson@gmail.com",
    manager: "Linda Brown",
    departmentName: "Operations",
    location: "Boston HQ",
    employmentStatus: "ACTIVE",
    accountStatus: "UNREGISTERED",
    vpnStatus: "Inactive",
    userRegistered: "false",
    passwordExpiresOn: "2025-11-25",
    accounts: [
      { name: "COB-Application-CityHall", disabled: true },
    ],
  },
  {
    id: "h8107a566e7b426b9207e793c3f23b79",
    uid: "000652",
    legalFirstName: "Maria",
    legalLastName: "Garcia",
    email: "maria.garcia@boston.gov",
    personalEmail: "maria.garcia@gmail.com",
    manager: "Thomas Lee",
    departmentName: "IT",
    location: "Downtown Office",
    employmentStatus: "ACTIVE",
    accountStatus: "ACTIVE",
    vpnStatus: "Active",
    userRegistered: "true",
    passwordExpiresOn: "2025-12-10",
    accounts: [
      { name: "COB-Application-IAMDIR", disabled: false },
      { name: "COB-Application-PSHcmJdbc", disabled: false },
      { name: "IdentityNow", disabled: false },
    ],
  },
  {
    id: "83107a566e7b426b9207e793c3f23b72",
    uid: "000645",
    legalFirstName: "Kevin",
    legalLastName: "O'Brien",
    email: "kevin.obrien@boston.gov",
    personalEmail: "kevin.obrien@gmail.com",
    manager: "Jane Doe",
    departmentName: "Boston Public Schools",
    location: "Boston City Hall",
    employmentStatus: "ACTIVE",
    accountStatus: "UNREGISTERED",
    vpnStatus: "Inactive",
    userRegistered: "false",
    passwordExpiresOn: "2025-12-31",
    accounts: [
      { name: "COB-Application-PSHcmJdbc", disabled: false },
      { name: "COB-Application-CityHall", disabled: true },
    ],
  },
  {
    id: "b2107a566e7b426b9207e793c3f23b73",
    uid: "000646",
    legalFirstName: "Alice",
    legalLastName: "Johnson",
    email: "alice.johnson@boston.gov",
    personalEmail: "alice.johnson@gmail.com",
    manager: "Bob Smith",
    departmentName: "Boston HQ",
    location: "Boston HQ",
    employmentStatus: "ACTIVE",
    accountStatus: "ACTIVE",
    vpnStatus: "Active",
    userRegistered: "true",
    passwordExpiresOn: "2025-11-30",
    accounts: [
      { name: "COB-Application-PSHcmJdbc", disabled: false },
      { name: "COB-Application-CityHall", disabled: false },
    ],
  },
  {
    id: "c3107a566e7b426b9207e793c3f23b74",
    uid: "000647",
    legalFirstName: "Bob",
    legalLastName: "Smith",
    email: "bob.smith@boston.gov",
    personalEmail: "bob.smith@gmail.com",
    manager: "Alice Johnson",
    departmentName: "Downtown Office",
    location: "Downtown Office",
    employmentStatus: "ACTIVE",
    accountStatus: "ACTIVE",
    vpnStatus: "Active",
    userRegistered: "true",
    passwordExpiresOn: "2025-10-15",
    accounts: [
      { name: "COB-Application-IAMDIR", disabled: false },
      { name: "IdentityNow", disabled: false },
    ],
  },
];

const shouldExcludeAccount = (name: string): boolean => {
  if (!name) return false;
  if (name === "IdentityNow") return true;
  if (name.includes("PSHcmJdbc")) return true;
  if (name.includes("Strivacity")) return true;
  return false;
};

const formatAccountName = (name: string): string => {
  if (!name) return "";
  if (name.includes("IAMDIR")) return "Central Identity Directory";
  if (name === "WebEx Control Hub - Service App") return "WebEx Hub";
  if (name.includes("PSHcmUserProfile")) return "Employee Self Service";
  return name;
};

export const searchDummy = (term: string): Identity[] => {
  const q = (term || "").trim().toLowerCase();
  if (!q) return dummyData;
  return dummyData
    .filter(
      (u) =>
        (u.uid && u.uid.toLowerCase().includes(q)) ||
        (u.legalFirstName && u.legalFirstName.toLowerCase().includes(q)) ||
        (u.legalLastName && u.legalLastName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    )
    .map((u) => ({
      ...u,
      accounts: u.accounts
        ? u.accounts
            .filter((acc) => !shouldExcludeAccount(acc.name))
            .map((acc) => ({
              ...acc,
              name: formatAccountName(acc.name),
            }))
        : [],
    }));
};

export const searchLocal = async (term: string): Promise<Identity[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // TODO: Replace with actual API call to Cobra endpoint
  return searchDummy(term);
};

