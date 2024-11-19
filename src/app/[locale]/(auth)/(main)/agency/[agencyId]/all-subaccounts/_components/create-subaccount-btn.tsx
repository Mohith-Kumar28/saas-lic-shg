'use client';
import type { Agency, AgencySidebarOption, SubAccount, User } from '@prisma/client';
import { PlusCircleIcon } from 'lucide-react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import SubAccountDetails from '@/components/forms/subaccount-details';
import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import { useModal } from '@/providers/modal-provider';

type Props = {
  user: User & {
    Agency:
      | (
        | Agency
        | (null & {
          SubAccount: SubAccount[];
          SideBarOption: AgencySidebarOption[];
        })
        )
        | null;
  };
  id: string;
  className: string;
};

const CreateSubaccountButton = ({ className, user }: Props) => {
  const { setOpen } = useModal();
  const agencyDetails = user.Agency;

  if (!agencyDetails) {
    return;
  }

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a Subaccount"
            subheading="You can switch bettween"
          >
            <SubAccountDetails
              agencyDetails={agencyDetails}
              _userId={user.id}
              userName={user.name}
            />
          </CustomModal>,
        );
      }}
    >
      <PlusCircleIcon size={15} />
      Create Sub Account
    </Button>
  );
};

export default CreateSubaccountButton;