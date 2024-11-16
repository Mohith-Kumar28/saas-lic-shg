import { redirect } from 'next/navigation';
import React from 'react';

import Unauthorized from '@/components/global';
import BlurPage from '@/components/global/blur-page';
import InfoBar from '@/components/global/infobar';
import Sidebar from '@/components/layout/sidebar';
import { type AccountTypes, accountTypes } from '@/constants/global-constants';
import { getClerkAuthUserDetails, getNotificationAndUser, verifyAndAcceptInvitation } from '@/lib/queries/user-queries';

type Props = {
  children: React.ReactNode;
  params: { agencyId: string };
};

const layout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await getClerkAuthUserDetails();

  if (!user) {
    return redirect('/');
  }

  if (!agencyId) {
    return redirect('/agency');
  }

  if (
    user.privateMetadata.role !== 'AGENCY_OWNER'
    && user.privateMetadata.role !== 'AGENCY_ADMIN'
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
          // notifications={allNoti}
          role={allNoti.User?.role}
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default layout;
