export type Role = 'AGENCY_OWNER' | 'AGENCY_ADMIN' | 'SUB_ACCOUNT_USER' | 'SUB_ACCOUNT_GUEST';

export const roles: { [key in Role]: Role } = {
  AGENCY_OWNER: 'AGENCY_OWNER',
  AGENCY_ADMIN: 'AGENCY_ADMIN',
  SUB_ACCOUNT_USER: 'SUB_ACCOUNT_USER',
  SUB_ACCOUNT_GUEST: 'SUB_ACCOUNT_GUEST',
};

export type Url = 'SUB_ACCOUNT' | 'SIGN_IN' | 'AGENCY' | 'BILLING' | 'LAUNCHPAD' | 'SETTINGS' | 'ALL_SUB_ACCOUNTS' | 'TEAM' | 'HOME' | 'SIGN_UP';

export const urls: { [key in Url]: string } = {
  SUB_ACCOUNT: '/subaccount',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  AGENCY: '/agency',
  BILLING: '/billing',
  LAUNCHPAD: '/launchpad',
  SETTINGS: '/settings',
  ALL_SUB_ACCOUNTS: '/all-subaccounts',
  TEAM: '/team',
  HOME: '/',
};
