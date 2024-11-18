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
  params: { agencyId: string };
  user: AuthUserTypes;
};

const layout = withAuthChecks(['hasAgency'], async ({ children, params, user }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();

  if (!user) {
    return redirect(urls.HOME);
  }

  if (!agencyId) {
    return redirect(urls.AGENCY);
  }

  if (
    !user.isAgencyAdmin
    && !user.isAgencyOwner
  ) {
    return <Unauthorized />;
  }

  let allNoti: any = [];
  const notifications = await getNotificationAndUser(agencyId);
  if (notifications) {
    allNoti = notifications;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        id={params.agencyId}
        type={accountTypes.AGENCY as AccountTypes}
      />
      <div className="md:pl-[300px]">
        <InfoBar
          notifications={allNoti}
          role={allNoti.User?.role}
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
});

export default layout;
