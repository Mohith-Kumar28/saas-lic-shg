import React from 'react';

import AgencyDetails from '@/components/forms/agency-details';
import UserDetails from '@/components/forms/user-details';
import withAuthChecks from '@/components/wrappers/auth-wrapper';
import { getAgencyDetails } from '@/lib/queries/agency-queries';
import type { AuthUserTypes } from '@/lib/queries/user-queries';

type Props = {
  params: { agencyId: string };
  user: AuthUserTypes;
};

const SettingsPage = withAuthChecks(['hasAgency'], async ({ params, user }: Props) => {
  const agencyDetails = await getAgencyDetails(params.agencyId);

  // const agencyDetails = user.Agency;
  if (!agencyDetails) {
    return null;
  }

  const subAccounts = agencyDetails.SubAccount;

  return (
    <div className="flex flex-col gap-4 lg:!flex-row">
      <AgencyDetails data={agencyDetails} />
      <UserDetails
        type="agency"
        id={params.agencyId}
        subAccounts={subAccounts}
        userData={user}
      />
    </div>
  );
});

export default SettingsPage;
