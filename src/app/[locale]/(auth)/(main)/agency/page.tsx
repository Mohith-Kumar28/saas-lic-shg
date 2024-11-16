import type { Plan } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';

import AgencyDetails from '@/components/forms/agency-details';
import { roles, urls } from '@/constants/global';
import { logger } from '@/lib/Logger';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import { isSubAccountGuest, isSubAccountUser } from '@/utils/Helpers';

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  const agencyId = await verifyAndAcceptInvitation();
  logger.info(agencyId);

  // get the users details
  const user = await getAuthUserDetails();
  if (agencyId) {
    if (isSubAccountGuest(user) || isSubAccountUser(user)) {
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
  // const authUser = await currentUser();
  return (
    <div className="mt-4 flex items-center justify-center">
      <div className="max-w-[850px] rounded-xl border p-4">
        <h1 className="text-4xl"> Create An Agency</h1>
        <AgencyDetails
          data={{ companyEmail: user?.email }}
        />
      </div>
    </div>
  );
};

export default Page;
