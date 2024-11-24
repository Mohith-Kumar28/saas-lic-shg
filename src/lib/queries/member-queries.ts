'use server';
import type {
  Member,
} from '@prisma/client';

import { urls } from '@/constants/global-constants';

import { db } from '../DB';

/**
 * Upserts a member in the database. If the member already exists, it updates the member's data.
 * If the member does not exist, it creates a new member with the provided data.
 *
 * @param {Member} memberData - The data of the member to upsert.
 * @returns {Promise<null | Member>} - Returns the upserted member data or null if the email is not provided.
 */
export const upsertMember = async (memberData: Member) => {
  if (!memberData.email) {
    return null;
  }

  const response = await db.member.upsert({
    where: { id: memberData.id },
    update: memberData,
    create: {
      ...memberData,

      SidebarOption: {
        create: [

          {
            name: 'Settings',
            icon: 'settings',
            link: `${urls.MEMBER}${urls.SUB_ACCOUNT}/${memberData.id}${urls.SETTINGS}`,
          },

          {
            name: 'Members',
            icon: 'person',
            link: `${urls.MEMBER}${urls.SUB_ACCOUNT}/${memberData.id}${urls.MEMBERS}`,
          },
          {
            name: 'Dashboard',
            icon: 'category',
            link: `${urls.MEMBER}${urls.SUB_ACCOUNT}/${memberData.id}`,
          },
        ],
      },
    },
  });

  return response;
};

export const getMemberDetails = async ({ email }: { email: string }) => {
  const response = await db.member.findUnique({
    where: {
      email,
    },
    // include: {
    //   User: true,
    // },
  });
  return response;
};
