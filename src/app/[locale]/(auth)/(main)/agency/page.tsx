import type { Plan } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';

import AgencyDetails from '@/components/forms/agency-details';
import { roles, urls } from '@/constants/global-constants';
import { logger } from '@/lib/Logger';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries/user-queries';

const AgencyPage = async ({
  searchParams,

}: {
  searchParams: { plan: Plan; state: string; code: string };

}) => {
  const agencyId = await verifyAndAcceptInvitation();
  logger.info(agencyId);

  const user = await getAuthUserDetails();
  if (agencyId) {
    if (user?.isSubAccountUser) {
      return redirect(urls.SUB_ACCOUNT);
    } else if (user?.isSubAccountGuest) {
      return redirect(urls.MEMBER);
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

  return (
    <div className="mt-4 flex items-center justify-center">
      <AgencyDetails
        data={{ companyEmail: user?.email }}
      />
    </div>
  );
};

export default AgencyPage;
