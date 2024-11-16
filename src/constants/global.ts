export type Role = 'AGENCY_OWNER' | 'AGENCY_ADMIN' | 'SUB_ACCOUNT_USER' | 'SUB_ACCOUNT_GUEST';

export const roles: { [key in Role]: Role } = {
  AGENCY_OWNER: 'AGENCY_OWNER',
  AGENCY_ADMIN: 'AGENCY_ADMIN',
  SUB_ACCOUNT_USER: 'SUB_ACCOUNT_USER',
  SUB_ACCOUNT_GUEST: 'SUB_ACCOUNT_GUEST',
};

export type Url = 'SUB_ACCOUNT' | 'SIGN_IN' | 'AGENCY' | 'BILLING';

export const urls: { [key in Url]: string } = {
  SUB_ACCOUNT: '/subaccount',
  SIGN_IN: '/sign-in',
  AGENCY: '/agency',
  BILLING: '/billing',
};
