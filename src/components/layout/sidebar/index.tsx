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

const Sidebar = withAuthChecks(['hasAgency', 'isMember'], async ({ id, type, user }: Props) => {
  if (!user.Agency) {
    return;
  }

  // const details
  //   = type === accountTypes.AGENCY
  //     ? user?.Agency
  //     : user?.Agency.SubAccount.find(subaccount => subaccount.id === id);

  let details;

  switch (type) {
    case accountTypes.AGENCY:
      details = user?.Agency;
      break;
    case accountTypes.SUB_ACCOUNT:
      details = user?.Agency.SubAccount.find(subaccount => subaccount.id === id);
      break;
    case accountTypes.MEMBER:
      details = user?.Member;
      break;
    default:
      details = null;
  }

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

  // const sidebarOpt
  //   = type === accountTypes.AGENCY
  //     ? user.Agency.SidebarOption || []
  //     : user.Agency.SubAccount.find(subaccount => subaccount.id === id)
  //       ?.SidebarOption || [];

  let sidebarOptions;

  switch (type) {
    case accountTypes.AGENCY:
      sidebarOptions = user.Agency.SidebarOption || [];
      break;
    case accountTypes.SUB_ACCOUNT:
      sidebarOptions = user.Agency.SubAccount.find(subaccount => subaccount.id === id)
        ?.SidebarOption || [];
      break;
    case accountTypes.MEMBER:
      sidebarOptions = user.Member?.SidebarOption || [];
      break;
    default:
      sidebarOptions = null;
  }
  if (!sidebarOptions) {
    return;
  }

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
        sidebarOpt={sidebarOptions}
        subAccounts={subaccounts}
        user={user}
      />
      <MenuOptions
        details={details}
        _id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOptions}
        subAccounts={subaccounts}
        user={user}
      />
    </>
  );
});

export default Sidebar;
