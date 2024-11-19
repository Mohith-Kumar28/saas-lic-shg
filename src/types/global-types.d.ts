import type {
  Notification,
  Role,
} from '@prisma/client';

import type { getAuthUserDetails, getTeamUsers, getUserPermissions } from '@/lib/queries/user-queries';

// Use type safe message keys with `next-intl`
type Messages = typeof import('../locales/en.json');

// eslint-disable-next-line
declare interface IntlMessages extends Messages {}

export type NotificationWithUser =
  | ({
    User: {
      id: string;
      name: string;
      avatarUrl: string;
      email: string;
      createdAt: Date;
      updatedAt: Date;
      role: Role;
      agencyId: string | null;
    };
  } & Notification)[]
  | undefined;

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>;

export type AuthUserWithAgencySigebarOptionsSubAccounts = Prisma.PromiseReturnType<typeof getAuthUserDetails> & {
  isAgencyOwner: boolean;
  isAgencyAdmin: boolean;
  isSubAccountGuest: boolean;
  isSubAccountUser: boolean;
};

export type UsersWithAgencySubAccountPermissions =
  Prisma.PromiseReturnType<
    typeof getTeamUsers
  >;
