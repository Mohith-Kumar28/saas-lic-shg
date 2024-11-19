'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/button';
import { deleteSubaccount, getSubaccountDetails } from '@/lib/queries/sub-account-queries';
import { saveActivityLogsNotification } from '@/lib/queries/user-queries';

type Props = {
  subaccountId: string;
};

const DeleteButton = ({ subaccountId }: Props) => {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="destructive"
      className="text-white"
      onClick={async () => {
        const response = await getSubaccountDetails(subaccountId);
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Deleted a subaccount | ${response?.name}`,
          subaccountId,
        });
        await deleteSubaccount(subaccountId);
        router.refresh();
      }}
    >
      Delete Sub Account
    </Button>
  );
};

export default DeleteButton;
