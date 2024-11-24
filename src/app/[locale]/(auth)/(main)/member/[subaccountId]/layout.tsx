import { redirect } from 'next/navigation';
import React from 'react';

import Unauthorized from '@/components/global';
import BlurPage from '@/components/global/blur-page';
import InfoBar from '@/components/layout/infobar';
import Sidebar from '@/components/layout/sidebar';
import withAuthChecks from '@/components/wrappers/auth-wrapper';
import { type AccountTypes, accountTypes, urls } from '@/constants/global-constants';
import { type AuthUserTypes, getNotificationAndUser, verifyAndAcceptInvitation } from '@/lib/queries/user-queries';

type Props = {
  children: React.ReactNode;
  params: { subaccountId: string };
  user: AuthUserTypes;
};

const SubaccountLayout = withAuthChecks(['hasAgency', 'isMember'], async ({ children, params, user }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  if (!agencyId) {
    return <Unauthorized />;
  }

  if (!user) {
    return redirect(urls.HOME);
  }

  let notifications: any = [];

  if (!user.role) {
    return <Unauthorized />;
  } else {
    const hasPermission = user?.Permissions.find(
      permissions =>
        permissions.access && permissions.subAccountId === params.subaccountId,
    );

    if (!hasPermission) {
      // return <Unauthorized />;
    }

    const allNotifications = await getNotificationAndUser(agencyId);

    if (
      user.isAgencyAdmin
      || user.isAgencyOwner
    ) {
      notifications = allNotifications;
    } else {
      const filteredNotifications = allNotifications?.filter(
        item => item.subAccountId === params.subaccountId,
      );
      if (filteredNotifications) {
        notifications = filteredNotifications;
      }
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        user={user}
        id={params.subaccountId}
        type={accountTypes.MEMBER as AccountTypes}
      />

      <div className="md:pl-[300px]">
        <InfoBar
          notifications={notifications}
          role={user.role}
          subAccountId={params.subaccountId as string}
        />
        <div className="relative">

          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
});

export default SubaccountLayout;
