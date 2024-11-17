import React from 'react';

import withAuthChecks from '@/components/wrappers/auth-wrapper';
// import MenuOptions from './menu-options';
import { type AccountTypes, accountTypes } from '@/constants/global-constants';
import type { AuthUserTypes } from '@/lib/queries/user-queries';

import MenuOptions from './menu-options';

type Props = {
  id: string;
  type: AccountTypes;
  user: AuthUserTypes;
};

const Sidebar = withAuthChecks(['hasAgency'], async ({ id, type, user }: Props) => {
  if (!user.Agency) {
    return;
  }

  const details
    = type === accountTypes.AGENCY
      ? user?.Agency
      : user?.Agency.SubAccount.find(subaccount => subaccount.id === id);

  const isWhiteLabeledAgency = user.Agency.whiteLabel;
  if (!details) {
    return;
  }

  let sideBarLogo = user.Agency.agencyLogo ?? '';

  if (!isWhiteLabeledAgency) {
    if (type === accountTypes.SUB_ACCOUNT) {
      sideBarLogo
        = user?.Agency.SubAccount.find(subaccount => subaccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo || '';
    }
  }

  const sidebarOpt
    = type === accountTypes.AGENCY
      ? user.Agency.SidebarOption || []
      : user.Agency.SubAccount.find(subaccount => subaccount.id === id)
        ?.SidebarOption || [];

  const subaccounts = user.Agency.SubAccount.filter(subaccount =>
    user.Permissions.find(
      permission =>
        permission.subAccountId === subaccount.id && permission.access,
    ),
  );

  return (
    <>
      <MenuOptions
        defaultOpen
        details={details}
        _id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
      />
      <MenuOptions
        details={details}
        _id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
      />
    </>
  );
});

export default Sidebar;
