'use server';
import type {
  SubAccount,
} from '@prisma/client';
import { v4 } from 'uuid';

import { roles, urls } from '@/constants/global-constants';

import { db } from '../DB';
import { logger } from '../Logger';

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) {
    return null;
  }
  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccount.agencyId,
      },
      role: roles.AGENCY_OWNER,
    },
  });
  if (!agencyOwner) {
    return logger.error('🔴Erorr could not create subaccount');
  }
  const permissionId = v4();
  const response = await db.subAccount.upsert({
    where: { id: subAccount.id },
    update: subAccount,
    create: {
      ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        },
      },
      Pipeline: {
        create: { name: 'Lead Cycle' },
      },
      SidebarOption: {
        create: [
          {
            name: 'Launchpad',
            icon: 'clipboardIcon',
            link: `${urls.SUB_ACCOUNT}/${subAccount.id}${urls.LAUNCHPAD}`,
          },
          {
            name: 'Settings',
            icon: 'settings',
            link: `${urls.SUB_ACCOUNT}/${subAccount.id}${urls.SETTINGS}`,
          },
          // {
          //   name: 'Funnels',
          //   icon: 'pipelines',
          //   link: `${urls.SUB_ACCOUNT}/${subAccount.id}${urls.FUNNELS}`,
          // },
          {
            name: 'Media',
            icon: 'database',
            link: `${urls.SUB_ACCOUNT}/${subAccount.id}${urls.MEDIA}`,
          },
          // {
          //   name: 'Automations',
          //   icon: 'chip',
          //   link: `${urls.SUB_ACCOUNT}/${subAccount.id}/automations`,
          // },
          {
            name: 'Pipelines',
            icon: 'flag',
            link: `${urls.SUB_ACCOUNT}/${subAccount.id}${urls.PIPELINES}`,
          },
          {
            name: 'Contacts',
            icon: 'person',
            link: `${urls.SUB_ACCOUNT}/${subAccount.id}${urls.CONTACTS}`,
          },
          {
            name: 'Dashboard',
            icon: 'category',
            link: `${urls.SUB_ACCOUNT}/${subAccount.id}`,
          },
        ],
      },
    },
  });
  return response;
};
