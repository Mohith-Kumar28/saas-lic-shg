import type {
  Notification,
  Role,
} from '@prisma/client';

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
