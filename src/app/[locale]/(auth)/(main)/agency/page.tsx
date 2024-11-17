import type { Plan } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';

import AgencyDetails from '@/components/forms/agency-details';
import withAuthChecks from '@/components/wrappers/auth-wrapper';
import { roles, urls } from '@/constants/global-constants';
import { logger } from '@/lib/Logger';
import { type AuthUserTypes, getClerkAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries/user-queries';

const AgencyPage = withAuthChecks([], async ({
  searchParams,
  user,
}: {
  searchParams: { plan: Plan; state: string; code: string };
  user: AuthUserTypes;
}) => {
  const agencyId = await verifyAndAcceptInvitation();
  logger.info(agencyId);

  if (agencyId) {
    if (user?.isSubAccountGuest || user?.isSubAccountUser) {
      return redirect(urls.SUB_ACCOUNT);
    } else if (user?.role === roles.AGENCY_OWNER || user?.role === roles.AGENCY_ADMIN) {
      if (searchParams.plan) {
        return redirect(`${urls.AGENCY}/${agencyId}/${urls.BILLING}?plan=${searchParams.plan}`);
      }
      if (searchParams.state) {
        const statePath = searchParams.state.split('___')[0];
        const stateAgencyId = searchParams.state.split('___')[1];
        if (!stateAgencyId) {
          return <div>Not authorized</div>;
        }
        return redirect(
          `${urls.AGENCY}/${stateAgencyId}/${statePath}?code=${searchParams.code}`,
        );
      } else {
        return redirect(`${urls.AGENCY}/${agencyId}`);
      }
    } else {
      return <div>Not authorized</div>;
    }
  }
  const authUser = await getClerkAuthUserDetails();

  return (
    <div className="mt-4 flex items-center justify-center">
      <AgencyDetails
        data={{ companyEmail: authUser?.emailAddresses[0]?.emailAddress }}
      />
    </div>
  );
});

export default AgencyPage;
