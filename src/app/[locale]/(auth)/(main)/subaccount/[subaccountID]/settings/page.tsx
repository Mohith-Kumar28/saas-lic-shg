import SubAccountDetails from '@/components/forms/subaccount-details';
import UserDetails from '@/components/forms/user-details';
import BlurPage from '@/components/global/blur-page';
import withAuthChecks from '@/components/wrappers/auth-wrapper';
import { getAgencyDetails } from '@/lib/queries/agency-queries';
import { getSubaccountDetails } from '@/lib/queries/sub-account-queries';
import type { AuthUserTypes } from '@/lib/queries/user-queries';

type Props = {
  params: { subaccountId: string };
  user: AuthUserTypes;
};

const SubaccountSettingPage = withAuthChecks(['hasAgency', 'hasSubAccount'], async ({ params, user }: Props) => {
  const subAccount = await getSubaccountDetails(params.subaccountId);
  if (!subAccount) {
    return;
  }
  const agencyDetails = await getAgencyDetails(subAccount.agencyId);
  if (!agencyDetails) {
    return;
  }
  const subAccounts = agencyDetails.SubAccount;

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 lg:!flex-row">
        <SubAccountDetails
          agencyDetails={agencyDetails}
          details={subAccount}
          _userId={user.id}
          userName={user.name}
        />
        <UserDetails
          type="subaccount"
          id={params.subaccountId}
          subAccounts={subAccounts}
          userData={user}
        />
      </div>
    </BlurPage>
  );
});

export default SubaccountSettingPage;
