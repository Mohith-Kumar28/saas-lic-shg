'use server';

import type {
  Agency,
  Plan,
} from '@prisma/client';

import { urls } from '@/constants/global-constants';

import { db } from '../DB';
import { logger } from '../Logger';

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>,
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetails },
  });
  return response;
};

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({ where: { id: agencyId } });
  return response;
};

/**
 * Upserts an agency record in the database.
 *
 * @param agency - The agency object to be upserted.
 * @param _price - An optional plan object (not used in this function).
 * @returns The upserted agency details, or `null` if the agency's `companyEmail` is missing.
 */
export const upsertAgency = async (agency: Agency, _price?: Plan) => {
  if (!agency.companyEmail) {
    return null;
  }
  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: { email: agency.companyEmail },
        },
        ...agency,
        SidebarOption: {
          create: [
            {
              name: 'Dashboard',
              icon: 'category',
              link: `${urls.AGENCY}/${agency.id}`,
            },
            {
              name: 'Launchpad',
              icon: 'clipboardIcon',
              link: `${urls.AGENCY}/${agency.id}${urls.LAUNCHPAD}`,
            },
            {
              name: 'Billing',
              icon: 'payment',
              link: `${urls.AGENCY}/${agency.id}${urls.BILLING}`,
            },
            {
              name: 'Settings',
              icon: 'settings',
              link: `${urls.AGENCY}/${agency.id}${urls.SETTINGS}`,
            },
            {
              name: 'Sub Accounts',
              icon: 'person',
              link: `${urls.AGENCY}/${agency.id}${urls.ALL_SUB_ACCOUNTS}`,
            },
            {
              name: 'Team',
              icon: 'shield',
              link: `${urls.AGENCY}/${agency.id}${urls.TEAM}`,
            },
          ],
        },
      },
    });
    return agencyDetails;
  } catch (error) {
    logger.error(error);
    return null;
  }
};
