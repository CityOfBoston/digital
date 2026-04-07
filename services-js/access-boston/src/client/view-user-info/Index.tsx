/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { useState } from 'react';
import { SectionHeader } from '@cityofboston/react-fleet';
import Link from 'next/link';

import { Identity, ActiveTab } from './types';
import { FetchGraphql } from '@cityofboston/next-client-common';
import fetchViewUserInfo from './fetchViewUserInfo';

const MONTSERRAT_FONT = 'Montserrat, Arial, sans-serif';

const COLORS = {
  primary: '#091F2F',
  secondary: '#1871BD',
  secondaryHover: '#145a96',
  background: '#F5F7FA',
  border: '#E5E7EB',
  text: '#000000',
  textLight: '#6B7280',
  green: '#10B981',
  greenLight: '#D1FAE5',
  red: '#EF4444',
  redLight: '#FEE2E2',
  gray: '#9CA3AF',
  grayLight: '#F3F4F6',
};

const CONTAINER_STYLING = css({
  minHeight: '60vh',
  backgroundColor: COLORS.background,
  // Override SectionHeader styles to use Montserrat and all caps
  '& .sh-title': {
    fontFamily: MONTSERRAT_FONT,
    textTransform: 'uppercase',
  },
});

const HEADER_ROW_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '1rem',
});

const EXIT_BUTTON_STYLING = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '0.375rem',
  color: COLORS.text,
  fontSize: '0.875rem',
  fontWeight: 'normal',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: COLORS.grayLight,
    borderColor: COLORS.gray,
  },
});

const SEARCH_SECTION_STYLING = css({
  marginBottom: '2rem',
});

const SEARCH_FORM_STYLING = css({
  position: 'relative',
  maxWidth: '48rem',
  display: 'flex',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  borderRadius: '0.375rem',
  overflow: 'hidden',
  border: `1px solid ${COLORS.border}`,
  backgroundColor: 'white',
  '&:focus-within': {
    outline: '2px solid',
    outlineColor: COLORS.primary,
    outlineOffset: '2px',
  },
});

const SEARCH_ICON_STYLING = css({
  paddingLeft: '1rem',
  display: 'flex',
  alignItems: 'center',
  pointerEvents: 'none',
  color: COLORS.gray,
});

const SEARCH_INPUT_STYLING = css({
  width: '100%',
  padding: '0.75rem',
  paddingLeft: '0.75rem',
  paddingRight: '2.5rem',
  fontSize: '1rem',
  color: COLORS.text,
  outline: 'none',
  border: 'none',
  '::placeholder': {
    color: COLORS.gray,
  },
});

const CLEAR_BUTTON_STYLING = css({
  position: 'absolute',
  right: '150px',
  top: '50%',
  transform: 'translateY(-50%)',
  padding: '0.25rem',
  backgroundColor: 'transparent',
  border: 'none',
  color: COLORS.gray,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: COLORS.grayLight,
    color: COLORS.text,
  },
});

const SEARCH_BUTTON_STYLING = css({
  backgroundColor: COLORS.secondary,
  color: 'white',
  padding: '0.75rem 1.5rem',
  fontFamily: MONTSERRAT_FONT,
  fontWeight: 500,
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: COLORS.secondaryHover,
  },
  '&:disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
});

const ERROR_MESSAGE_STYLING = css({
  marginBottom: '1.5rem',
  padding: '1rem',
  backgroundColor: COLORS.redLight,
  borderLeft: `4px solid ${COLORS.red}`,
  color: '#991B1B',
  borderRadius: '0.25rem',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
});

const NO_RESULTS_STYLING = css({
  textAlign: 'center',
  padding: '3rem',
  backgroundColor: 'white',
  borderRadius: '0.5rem',
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  color: COLORS.text,
  fontWeight: 'normal',
  fontSize: '1.125rem',
});

const IDENTITY_CARD_STYLING = (isExpanded: boolean) =>
  css({
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    border: isExpanded
      ? `1px solid ${COLORS.primary}`
      : `1px solid ${COLORS.border}`,
    transition: 'all 0.2s',
    marginBottom: '1rem',
    boxShadow: isExpanded
      ? `0 4px 6px rgba(0, 0, 0, 0.1), 0 0 0 1px ${COLORS.primary}`
      : '0 1px 2px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: isExpanded ? COLORS.primary : '#D1D5DB',
      boxShadow: isExpanded
        ? `0 4px 6px rgba(0, 0, 0, 0.1), 0 0 0 1px ${COLORS.primary}`
        : '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
  });

const CARD_HEADER_STYLING = css({
  padding: '1.25rem',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'nowrap',
  gap: '1rem',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
});

const USER_INFO_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  minWidth: 0,
  flex: '1 1 auto',
});

const AVATAR_STYLING = css({
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '50%',
  backgroundColor: COLORS.grayLight,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#4B5563',
  fontWeight: 'bold',
  fontSize: '1.125rem',
  border: `1px solid ${COLORS.border}`,
});

const USER_DETAILS_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  minWidth: 0,
  flex: '1 1 auto',
  overflow: 'hidden',
});

const USER_NAME_STYLING = css({
  fontSize: '1.125rem',
  fontFamily: MONTSERRAT_FONT,
  fontWeight: 600,
  textTransform: 'uppercase',
  color: COLORS.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const USER_META_STYLING = css({
  fontSize: '0.875rem',
  color: COLORS.text,
  fontWeight: 'normal',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flexWrap: 'nowrap',
  '& > span:last-child': {
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    flex: '1 1 auto',
    minWidth: 0,
  },
});

const UID_BADGE_STYLING = css({
  fontFamily: 'monospace',
  backgroundColor: COLORS.grayLight,
  padding: '0.125rem 0.375rem',
  borderRadius: '0.25rem',
  fontSize: '0.75rem',
});

const CARD_ACTIONS_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  flexShrink: 0,
  '@media (max-width: 768px)': {
    width: '100%',
    justifyContent: 'space-between',
  },
});

const DEPT_INFO_STYLING = css({
  textAlign: 'right',
  minWidth: 0,
  maxWidth: '150px',
  '& > div': {
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  '@media (max-width: 768px)': {
    display: 'none',
  },
});

const STATUS_BADGE_STYLING = (status: string) => {
  const lower = (status || '').toLowerCase();
  const isActive = lower === 'active';
  const isPending = lower === 'pending';

  let bgColor = COLORS.grayLight;
  let textColor = '#4B5563';
  let borderColor = COLORS.border;

  if (isActive) {
    bgColor = COLORS.greenLight;
    textColor = '#065F46';
    borderColor = '#10B981';
  } else if (isPending) {
    bgColor = '#FEF3C7';
    textColor = '#92400E';
    borderColor = '#F59E0B';
  }

  return css({
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontFamily: MONTSERRAT_FONT,
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.05em',
    backgroundColor: bgColor,
    color: textColor,
    border: `1px solid ${borderColor}`,
  });
};

const CHEVRON_STYLING = (isExpanded: boolean) =>
  css({
    width: '1.25rem',
    height: '1.25rem',
    color: COLORS.gray,
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
    transition: 'transform 0.2s',
  });

const EXPANDED_CONTENT_STYLING = css({
  borderTop: `1px solid ${COLORS.border}`,
  backgroundColor: '#FAFAFA',
  borderBottomLeftRadius: '0.5rem',
  borderBottomRightRadius: '0.5rem',
});

const TABS_CONTAINER_STYLING = css({
  padding: '0 1.5rem',
  paddingTop: '0.5rem',
  display: 'flex',
  gap: '1.5rem',
  borderBottom: `1px solid ${COLORS.border}`,
});

const TAB_BUTTON_STYLING = (isActive: boolean) =>
  css({
    paddingBottom: '0.75rem',
    paddingTop: '0.5rem',
    fontSize: '0.875rem',
    fontFamily: MONTSERRAT_FONT,
    fontWeight: 500,
    textTransform: 'uppercase',
    color: isActive ? COLORS.primary : COLORS.textLight,
    transition: 'all 0.2s',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottom: isActive ? `2px solid ${COLORS.primary}` : '2px solid transparent',
    '&:hover': {
      color: isActive ? COLORS.primary : COLORS.text,
    },
  });

const TAB_CONTENT_STYLING = css({
  padding: '1.5rem',
});

const ATTRIBUTES_GRID_STYLING = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 1fr)',
  gap: '1.5rem 2rem',
  '@media (min-width: 768px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (min-width: 1024px)': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
});

const ATTRIBUTE_ITEM_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
});

const ATTRIBUTE_LABEL_STYLING = css({
  fontSize: '0.75rem',
  fontFamily: MONTSERRAT_FONT,
  fontWeight: 600,
  color: COLORS.textLight,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

const ATTRIBUTE_VALUE_STYLING = css({
  fontSize: '0.875rem',
  color: COLORS.text,
  fontWeight: 'normal',
  wordBreak: 'break-word',
});

const ATTRIBUTE_NA_STYLING = css({
  color: COLORS.gray,
  fontStyle: 'italic',
});

const ACCOUNTS_TABLE_STYLING = css({
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '0.375rem',
  overflow: 'hidden',
});

const TABLE_STYLING = css({
  minWidth: '100%',
  borderCollapse: 'collapse',
});

const TABLE_HEAD_STYLING = css({
  backgroundColor: COLORS.grayLight,
});

const TABLE_HEADER_CELL_STYLING = css({
  padding: '0.75rem 1.5rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontFamily: MONTSERRAT_FONT,
  fontWeight: 500,
  color: COLORS.textLight,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

const TABLE_BODY_STYLING = css({
  backgroundColor: 'white',
  '& tr': {
    borderTop: `1px solid ${COLORS.border}`,
  },
});

const TABLE_CELL_STYLING = css({
  padding: '1rem 1.5rem',
  whiteSpace: 'nowrap',
  fontSize: '0.875rem',
  fontWeight: 'normal',
  color: COLORS.text,
});

const ACCOUNT_STATUS_BADGE_STYLING = (disabled: boolean) =>
  css({
    padding: '0.125rem 0.5rem',
    display: 'inline-flex',
    fontSize: '0.75rem',
    fontFamily: MONTSERRAT_FONT,
    lineHeight: '1.25rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    borderRadius: '9999px',
    backgroundColor: disabled ? COLORS.redLight : COLORS.greenLight,
    color: disabled ? '#991B1B' : '#065F46',
  });

const NO_ACCOUNTS_STYLING = css({
  padding: '2rem',
  textAlign: 'center',
  color: COLORS.text,
  fontWeight: 'normal',
});

interface Props {
  fetchGraphql: FetchGraphql;
}

// Helper function to format a string to normal case (first letter uppercase, rest lowercase)
const toNormalCase = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/** Optional directory fields: omit blank/whitespace so we do not show placeholder text when absent. */
const optionalDisplayText = (value: string | undefined | null): string | undefined => {
  if (value == null) return undefined;
  const t = String(value).trim();
  return t.length ? t : undefined;
};

// Helper function to format email values
const formatEmail = (email: string | undefined): string | undefined => {
  if (!email) return undefined;
  if (email.toUpperCase() === 'NO_EMAIL') return 'Email Not Available';
  return email;
};

// Helper function to format employment status
const formatEmploymentStatus = (status: string | undefined): string | undefined => {
  if (!status) return 'N/A';
  const upperStatus = status.toUpperCase();
  if (upperStatus === 'UNKNOWN') return 'N/A';
  if (upperStatus === 'ACTIVE') return 'Active';
  return status;
};

// Helper function to format user registered status
const formatUserRegistered = (registered: string | undefined): string | undefined => {
  if (!registered) return undefined;
  if (registered.toLowerCase() === 'false') return 'Not Registered';
  return registered;
};

// Helper function to format VPN status
const formatVpnStatus = (vpnStatus: string | undefined): string => {
  if (!vpnStatus) return 'Inactive';
  const lowerStatus = vpnStatus.toLowerCase();
  if (lowerStatus === 'true') return 'Active';
  if (lowerStatus === 'false') return 'Inactive';
  return vpnStatus;
};

// Helper function to format application names
const formatApplicationName = (appName: string): string => {
  const appMappings: { [key: string]: string } = {
    'COB-Application-CityHall': 'City Hall AD',
    'COB-Application-Gapps': 'Google/boston.gov',
    'COB-Application-Gapps-BPD': 'Google/pd.boston.gov',
    'COB-Application-Slack': 'Slack',
    'COB-Application-BPS': 'BPS AD',
    'COB-Application-Assessing': 'Assessing AD',
    'COB-Application-BPD': 'BPD AD',
    'COB-Application-BFD': 'BFD AD',
  };

  if (appMappings[appName]) return appMappings[appName];

  const lower = appName.toLowerCase();
  if (lower === 'servicenow - prod' || lower === 'servicenow') return 'Beacon';

  return appName;
};

// Helper function to get display name (preferred if available, otherwise legal)
const getDisplayName = (identity: Identity): string => {
  const firstName = identity.preferredFirstName || identity.legalFirstName || '';
  const lastName = identity.preferredLastName || identity.legalLastName || '';
  return `${firstName} ${lastName}`.trim() || 'Unknown';
};

export default function ViewUserInfoIndex({ fetchGraphql }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('attributes');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setExpandedRow(null);

    try {
      console.log('[ViewUserInfoIndex] Starting search for:', searchTerm);
      // Call the real API with User ID or Name (returns array)
      const userInfoResults = await fetchViewUserInfo(fetchGraphql, searchTerm);
      console.log('[ViewUserInfoIndex] Received results:', userInfoResults);
      console.log('[ViewUserInfoIndex] Results count:', userInfoResults ? userInfoResults.length : 0);
      setResults(userInfoResults);
    } catch (err) {
      console.error('[ViewUserInfoIndex] Error during search:', err);
      setError('User not found or failed to fetch results. Please try again with a valid User ID or Name.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
      setActiveTab('attributes');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setError(null);
    setSearched(false);
  };

  return (
    <div css={CONTAINER_STYLING}>
      <div className="b b-c b-c--hsm">
        <div css={HEADER_ROW_STYLING}>
          <Link href="/">
            <a css={EXIT_BUTTON_STYLING}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </a>
          </Link>
        </div>

        <SectionHeader title="Identity Search" />

        <div css={SEARCH_SECTION_STYLING}>
          <form onSubmit={handleSearch} css={SEARCH_FORM_STYLING}>
            <div css={SEARCH_ICON_STYLING}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              css={SEARCH_INPUT_STYLING}
              placeholder="Search by User ID or Legal Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && !loading && (
              <button
                type="button"
                css={CLEAR_BUTTON_STYLING}
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button type="submit" disabled={loading} css={SEARCH_BUTTON_STYLING}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {error && (
          <div css={ERROR_MESSAGE_STYLING}>
            <p style={{ fontFamily: MONTSERRAT_FONT, fontWeight: 500, textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>Error</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 'normal', margin: 0 }}>{error}</p>
          </div>
        )}

        <div>
          {searched && !loading && results.length === 0 && !error && (
            <div css={NO_RESULTS_STYLING}>
              <p>No identities found.</p>
            </div>
          )}

          {results.map((identity, index) => {
            const uniqueKey = `${identity.uid}-${index}`;
            const locationDisplay = optionalDisplayText(identity.location);
            const isExpanded = expandedRow === uniqueKey;

            return (
              <div key={uniqueKey} css={IDENTITY_CARD_STYLING(isExpanded)}>
                <div css={CARD_HEADER_STYLING} onClick={() => toggleRow(uniqueKey)}>
                  <div css={USER_INFO_STYLING}>
                    <div css={AVATAR_STYLING}>
                      {(((identity.preferredFirstName || identity.legalFirstName || identity.uid || '?')[0])).toUpperCase()}
                    </div>
                    <div css={USER_DETAILS_STYLING}>
                      <h3 css={USER_NAME_STYLING}>
                        {getDisplayName(identity)}
                      </h3>
                      <div css={USER_META_STYLING}>
                        <span css={UID_BADGE_STYLING}>{identity.uid}</span>
                        <span>•</span>
                        <span>{formatEmail(identity.email)}</span>
                      </div>
                    </div>
                  </div>

                  <div css={CARD_ACTIONS_STYLING}>
                    <div css={DEPT_INFO_STYLING}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'normal', color: COLORS.text }}>
                        {identity.departmentName || 'No Dept'}
                      </div>
                      {locationDisplay && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: COLORS.text }}>
                          {locationDisplay}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span css={STATUS_BADGE_STYLING(identity.cloudLifecycleState || '')}>
                        {identity.cloudLifecycleState ? toNormalCase(identity.cloudLifecycleState) : 'Unknown'}
                      </span>
                      <svg css={CHEVRON_STYLING(isExpanded)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div css={EXPANDED_CONTENT_STYLING}>
                    <div css={TABS_CONTAINER_STYLING}>
                      <button
                        css={TAB_BUTTON_STYLING(activeTab === 'attributes')}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('attributes');
                        }}
                        type="button"
                      >
                        Attributes
                      </button>
                      <button
                        css={TAB_BUTTON_STYLING(activeTab === 'accounts')}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('accounts');
                        }}
                        type="button"
                      >
                        Accounts{' '}
                        <span
                          style={{
                            marginLeft: '0.25rem',
                            backgroundColor: COLORS.border,
                            color: COLORS.text,
                            fontWeight: 'normal',
                            padding: '0 0.375rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                          }}
                        >
                          {identity.accounts ? identity.accounts.length : 0}
                        </span>
                      </button>
                    </div>

                    <div css={TAB_CONTENT_STYLING}>
                      {activeTab === 'attributes' ? (
                        <div css={ATTRIBUTES_GRID_STYLING}>
                          {[
                            ['User ID', identity.uid],
                            ...(identity.preferredFirstName
                              ? [['Preferred First Name', identity.preferredFirstName] as [string, string | undefined]]
                              : []),
                            ...(identity.preferredLastName
                              ? [['Preferred Last Name', identity.preferredLastName] as [string, string | undefined]]
                              : []),
                            ['Legal First Name', identity.legalFirstName],
                            ...(identity.middleName
                              ? [['Middle Name', identity.middleName] as [string, string | undefined]]
                              : []),
                            ['Legal Last Name', identity.legalLastName],
                            ['Email', formatEmail(identity.email)],
                            ['Personal Email', formatEmail(identity.personalEmail)],
                            ['Manager', optionalDisplayText(identity.manager)],
                            ['Department', identity.departmentName],
                            ['Location', optionalDisplayText(identity.location)],
                            ['Employment Status', formatEmploymentStatus(identity.employmentStatus)],
                            ['VPN Status', formatVpnStatus(identity.vpnStatus)],
                            ['User Registered', formatUserRegistered(identity.userRegistered)],
                            ['Password Expires On', identity.passwordExpiresOn],
                            ['Start Date', identity.startDate],
                            ['End Date', identity.endDate] as [string, string | undefined],
                            ...(identity.isVip
                              ? [['VIP', identity.isVip] as [string, string | undefined]]
                              : []),
                            ...(!identity.isEmployee || optionalDisplayText(identity.sponsor)
                              ? [
                                  ['Sponsor', optionalDisplayText(identity.sponsor)] as [
                                    string,
                                    string | undefined,
                                  ],
                                ]
                              : []),
                          ].map(([label, val]) => (
                            <div key={label} css={ATTRIBUTE_ITEM_STYLING}>
                              <div css={ATTRIBUTE_LABEL_STYLING}>{label}</div>
                              <div css={ATTRIBUTE_VALUE_STYLING}>
                                {val || <span css={ATTRIBUTE_NA_STYLING}>N/A</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div css={ACCOUNTS_TABLE_STYLING}>
                          {identity.accounts && identity.accounts.length > 0 ? (
                            <table css={TABLE_STYLING}>
                              <thead css={TABLE_HEAD_STYLING}>
                                <tr>
                                  <th css={TABLE_HEADER_CELL_STYLING}>Application</th>
                                  <th css={TABLE_HEADER_CELL_STYLING}>Status</th>
                                </tr>
                              </thead>
                              <tbody css={TABLE_BODY_STYLING}>
                                {identity.accounts.map((acc, idx) => (
                                  <tr key={idx}>
                                    <td css={TABLE_CELL_STYLING}>{formatApplicationName(acc.name)}</td>
                                    <td css={TABLE_CELL_STYLING}>
                                      <span css={ACCOUNT_STATUS_BADGE_STYLING(acc.disabled)}>
                                        {acc.disabled ? 'Inactive' : 'Active'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div css={NO_ACCOUNTS_STYLING}>No accounts found for this identity.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

