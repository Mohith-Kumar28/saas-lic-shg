import { Plus } from 'lucide-react';
import React from 'react';

import SendInvitation from '@/components/forms/send-invitation';
import { columns } from '@/components/tables/users-table/columns';
import DataTable from '@/components/tables/users-table/data-table';
import withAuthChecks from '@/components/wrappers/auth-wrapper';
import { getAgencyDetails } from '@/lib/queries/agency-queries';
import { getTeamUsers } from '@/lib/queries/user-queries';

type Props = {
  params: { agencyId: string };
};

const TeamPage = withAuthChecks(['hasAgency'], async ({ params }: Props) => {
  const teamMembers = await getTeamUsers(params.agencyId);

  const agencyDetails = await getAgencyDetails(params.agencyId);

  if (!agencyDetails) {
    return null;
  }
  return (
    <DataTable
      actionButtonText={(
        <>
          <Plus size={15} />
          Add
        </>
      )}
      modalChildren={<SendInvitation agencyId={agencyDetails.id} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    >
    </DataTable>
  );
});

export default TeamPage;
