import { redirect } from 'next/navigation';
import React from 'react';

import Unauthorized from '@/components/global';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries/user-queries';

const SubAccountMainPage = async () => {
  const agencyId = await verifyAndAcceptInvitation();

  if (!agencyId) {
    return <Unauthorized />;
  }
  const user = await getAuthUserDetails();

  const getFirstSubaccountWithAccess = user?.Permissions.find(
    permission => permission.access === true,
  );

  // this is for payment gateway integration
  // if (searchParams.state) {
  //   const statePath = searchParams.state.split('___')[0];
  //   const stateSubaccountId = searchParams.state.split('___')[1];
  //   if (!stateSubaccountId) {
  //     return <Unauthorized />;
  //   }
  //   return redirect(
  //     `/subaccount/${stateSubaccountId}/${statePath}?code=${searchParams.code}`,
  //   );
  // }

  if (getFirstSubaccountWithAccess) {
    return redirect(`/subaccount/${getFirstSubaccountWithAccess.subAccountId}`);
  }

  return <Unauthorized />;
};

export default SubAccountMainPage;
