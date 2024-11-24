'use server';

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import type {
  Prisma,
  Role,
  User,
} from '@prisma/client';
import { redirect } from 'next/navigation';
import { v4 } from 'uuid';

import { roles, urls } from '@/constants/global-constants';

import { db } from '../DB';
import { logger } from '../Logger';

/**
 * Retrieves the authenticated user's details, including their associated agency, sub-accounts, and permissions.
 *
 * This function first retrieves the current authenticated user using the `currentUser()` function from the Clerk SDK. If no user is authenticated, it returns `null`.
 *
 * If a user is authenticated, the function then queries the database to retrieve the user's details, including their associated agency, sub-accounts, and permissions. The returned object includes additional properties (`isAgencyOwner`, `isAgencyAdmin`, `isSubAccountGuest`, `isSubAccountUser`) that indicate the user's role.
 *
 * @returns {Promise<(typeof userData & { isAgencyOwner: boolean; isAgencyAdmin: boolean; isSubAccountGuest: boolean; isSubAccountUser: boolean; }) | null>} The authenticated user's details, or `null` if no user is authenticated.
 */

export type AuthUserTypes = Prisma.UserGetPayload<{
  include: {
    Agency: {
      include: {
        SidebarOption: true;
        SubAccount: {
          include: {
            SidebarOption: true;
          };
        };
      };
    };
    Member: {
      include: {
        SidebarOption: true;
      };
    };
    Permissions: true;
  };
}> & {
  isAgencyOwner: boolean;
  isAgencyAdmin: boolean;
  isSubAccountGuest: boolean;
  isSubAccountUser: boolean;
};
export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) {
    return null;
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
      Member: {
        include: {
          SidebarOption: true,
        },
      },
      Permissions: true,
    },
  });

  if (userData) {
    return {
      ...userData,
      isAgencyOwner: userData.role === roles.AGENCY_OWNER,
      isAgencyAdmin: userData.role === roles.AGENCY_ADMIN,
      isSubAccountGuest: userData.role === roles.SUB_ACCOUNT_GUEST,
      isSubAccountUser: userData.role === roles.SUB_ACCOUNT_USER,
    };
  };
  return null; // Return null if user is not authenticated
};

/**
 * Retrieves the details of the authenticated Clerk user.
 *
 * @returns {Promise<User | undefined>} - The authenticated user, or undefined if the user is not authenticated.
 */
export const getClerkAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  return user;
};

/**
 * Initializes a user in the database. If the user does not exist, it creates a new user entry.
 * If the user already exists, it updates the user with the provided data.
 *
 * @param {Partial<User>} newUser - An object containing the new user data to be updated or created.
 * @returns {Promise<User | undefined>} - The user data after upsert operation or undefined if the current user is not found.
 *
 * @throws {Error} - Throws an error if the email address is undefined.
 */
export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0]?.emailAddress || '',
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0]?.emailAddress ?? (() => {
        throw new Error('Email address is undefined');
      })(),
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || roles.SUB_ACCOUNT_USER,
    },
  });

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || roles.SUB_ACCOUNT_USER,
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
  const authUser = await getClerkAuthUserDetails();
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
 * Updates the permissions for a user in a sub-account.
 *
 * @param permissionId - The ID of the permission to update, or undefined to create a new permission.
 * @param userEmail - The email address of the user whose permissions are being updated.
 * @param subAccountId - The ID of the sub-account the user belongs to.
 * @param permission - A boolean indicating whether the user should have access or not.
 * @returns The updated or created permission object, or null if an error occurs.
 */
export const changeUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean,
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId,
      },
    });
    return response;
  } catch (error) {
    logger.error('🔴Could not change permission', error);
    return null;
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
  if (user.role === roles.AGENCY_OWNER) {
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
    return redirect(urls.SIGN_IN);
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
      if (invitationExists.subaccountId) {
        await changeUserPermissions(
          v4(),
          userDetails?.email,
          invitationExists.subaccountId,
          true,
        );
      }
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || roles.SUB_ACCOUNT_USER,
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
    const userFromDB = await db.user.findUnique({
      where: {
        email: user?.emailAddresses[0]?.emailAddress,
      },
    });

    return userFromDB ? userFromDB.agencyId : null;
  }
};

/**
 * Retrieves a list of notifications and their associated users for the given agency ID, ordered by creation date in descending order.
 *
 * @param agencyId - The ID of the agency to retrieve notifications for.
 * @returns An array of notification objects, each containing the associated user data, or null if an error occurs.
 */
export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { agencyId },
      include: { User: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return response;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

/**
 * Retrieves the permissions and sub-account information for the user with the specified ID.
 *
 * @param userId - The ID of the user to retrieve permissions for.
 * @returns The user's permissions and sub-account information, or null if the user is not found.
 */
export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  });

  return response;
};

/**
 * Updates a user's information, including their role, in the database and Clerk.
 *
 * @param user - A partial user object containing the updated information.
 * @returns The updated user object.
 */
export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: { email: user.email },
    data: { ...user },
  });

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || roles.SUB_ACCOUNT_USER,
    },
  });

  return response;
};

/**
 * Sends an invitation to the specified email address with the given role and agency ID.
 *
 * @param role - The role to assign to the invited user.
 * @param email - The email address of the user to invite.
 * @param agencyId - The ID of the agency the invited user will be associated with.
 * @returns The created invitation object.
 */
export const sendInvitation = async (
  { role, email, agencyId, subaccountId }: {
    role: Role;
    email: string;
    agencyId?: string;
    subaccountId?: string;
  },
) => {
  let foundOrGivenAgencyId = agencyId;

  if (!foundOrGivenAgencyId && !subaccountId) {
    throw new Error(
      'You need to provide at least an agency Id or subaccount Id',
    );
  }

  if (subaccountId) {
    const subaccountRes = await db.subAccount.findUnique({
      where: { id: subaccountId },
    });
    if (subaccountRes) {
      foundOrGivenAgencyId = subaccountRes.agencyId;
    }
  }

  if (!foundOrGivenAgencyId) {
    throw new Error('Agency Id could not be determined');
  }

  const InvitationResponse = await db.invitation.create({
    data: { email, agencyId: foundOrGivenAgencyId, role, subaccountId },
  });

  try {
    await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_URL}${urls.AGENCY}`,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });
  } catch (error) {
    logger.error(error);
    // throw error;
  }

  return InvitationResponse;
};

/**
 * Retrieves the first user with the specified agency ID, including their agency and sub-account permissions.
 *
 * @param agencyId - The ID of the agency to filter users by.
 * @returns The first user that matches the specified agency ID, including their agency and sub-account permissions.
 */
export const getTeamUsers = async (
  agencyId: string,
) => {
  const response = await db.user.findMany({
    where: { Agency: { id: agencyId } },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  });

  return response;
};

/**
 * Deletes a user from the database and updates their metadata in Clerk.
 *
 * @param userId - The ID of the user to delete.
 * @returns The deleted user object.
 */
export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  });
  const deletedUser = await db.user.delete({ where: { id: userId } });

  return deletedUser;
};

/**
 * Retrieves a user from the database by their unique identifier.
 *
 * @param id - The ID of the user to retrieve.
 * @returns The user object, or `null` if not found.
 */
export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};
