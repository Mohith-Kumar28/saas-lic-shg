'use server';

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import type {
  User,
} from '@prisma/client';
import { redirect } from 'next/navigation';

import { Roles } from '@/constants/global';

import { db } from './DB';
import { logger } from './Logger';

/**
 * Retrieves the authenticated user's details, including their associated agency, sidebar options, sub-accounts, and permissions.
 *
 * @returns {Promise<UserData | undefined>} A promise that resolves to the user's data, or undefined if the user is not authenticated.
 */
export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const userData = await db.user.findUnique({
    where: {
      email: user?.emailAddresses[0]?.emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  });

  return userData;
};

/**
 * Saves an activity log notification for the specified agency, description, and optional sub-account.
 *
 * This function retrieves the authenticated user's details, or finds a user associated with the provided sub-account ID. It then creates a new notification record in the database, connecting it to the user, the agency, and the optional sub-account.
 *
 * @param {object} params - The parameters for the activity log notification.
 * @param {string} [params.agencyId] - The ID of the agency associated with the notification.
 * @param {string} params.description - The description of the activity log notification.
 * @param {string} [params.subaccountId] - The ID of the sub-account associated with the notification.
 * @returns {Promise<void>} A promise that resolves when the notification is saved.
 */
export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string;
  description: string;
  subaccountId?: string;
}) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: { id: subaccountId },
          },
        },
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0]?.emailAddress },
    });
  }

  if (!userData) {
    logger.error('Could not find a user');
    return;
  }

  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subaccountId) {
      throw new Error(
        'You need to provide atleast an agency Id or subaccount Id',
      );
    }
    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    });
    if (response) {
      foundAgencyId = response.agencyId;
    }
  }
  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: { id: subaccountId },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};

/**
 * Creates a new team user with the provided user details.
 *
 * This function creates a new user record in the database with the provided user details, except if the user's role is 'AGENCY_OWNER', in which case it returns null.
 *
 * @param agencyId - The ID of the agency the user belongs to.
 * @param user - The user details to create the new user with.
 * @returns The created user record, or null if the user's role is 'AGENCY_OWNER'.
 */
export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === Roles.AGENCY_OWNER) {
    return null;
  }
  const response = await db.user.create({ data: { ...user } });
  return response;
};

/**
 * Verifies and accepts an invitation for the current user.
 *
 * This function checks if the current user has a pending invitation in the database. If an invitation is found, it creates a new team user with the invitation details, updates the user's metadata, and deletes the invitation. If no invitation is found, it returns the agency ID associated with the user.
 *
 * @returns {Promise<string | null>} A promise that resolves to the agency ID if the invitation is accepted, or null if no invitation is found.
 */
export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) {
    return redirect('/sign-in');
  }
  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user?.emailAddresses[0]?.emailAddress,
      status: 'PENDING',
    },
  });

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await saveActivityLogsNotification({
      agencyId: invitationExists?.agencyId,
      description: `Joined`,
      subaccountId: undefined,
    });

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || Roles.SUBACCOUNT_USER,
        },
      });

      await db.invitation.delete({
        where: { email: userDetails.email },
      });

      return userDetails.agencyId;
    } else {
      return null;
    }
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user?.emailAddresses[0]?.emailAddress,
      },
    });
    return agency ? agency.agencyId : null;
  }
};
