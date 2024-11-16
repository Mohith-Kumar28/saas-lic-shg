import type { User } from '@sentry/nextjs';

import { roles } from '@/constants/global-constants';

import { AppConfig } from './AppConfig';

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (
    process.env.VERCEL_ENV === 'production'
    && process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
};

export const getI18nPath = (url: string, locale: string) => {
  if (locale === AppConfig.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

export const isAgencyOwner = (user: User | undefined): boolean => {
  return user?.role === roles.AGENCY_OWNER;
};
export const isAgencyAdmin = (user: User | undefined): boolean => {
  return user?.role === roles.AGENCY_ADMIN;
};
export const isSubAccountGuest = (user: User | undefined): boolean => {
  return user?.role === roles.SUB_ACCOUNT_GUEST;
};
export const isSubAccountUser = (user: User | undefined): boolean => {
  return user?.role === roles.SUB_ACCOUNT_USER;
};
