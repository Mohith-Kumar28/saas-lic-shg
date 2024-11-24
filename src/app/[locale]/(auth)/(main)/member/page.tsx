import { redirect } from 'next/navigation';
import React from 'react';

import MemberDetails from '@/components/forms/member-details';
import Unauthorized from '@/components/global';
import { urls } from '@/constants/global-constants';
import { logger } from '@/lib/Logger';
import { getMemberDetails } from '@/lib/queries/member-queries';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries/user-queries';

const MemberPage = async (
) => {
  const agencyId = await verifyAndAcceptInvitation();

  if (!agencyId) {
    return <Unauthorized />;
  }
  const user = await getAuthUserDetails();

  const getFirstSubaccountWithAccess = user?.Permissions.find(
    permission => permission.access === true,
  );
  if (!getFirstSubaccountWithAccess || !user) {
    return <Unauthorized />;
  }

  const member = await getMemberDetails({ email: user.email });
  logger.info(member);

  if (member) {
    return redirect(`${urls.MEMBER}/${member.subAccountId}`);
  }

  return (
    <div className="mt-4 flex items-center justify-center">
      <MemberDetails
        email={user.email}
        subAccountId={getFirstSubaccountWithAccess?.subAccountId}
      />
    </div>
  );
};

export default MemberPage;
