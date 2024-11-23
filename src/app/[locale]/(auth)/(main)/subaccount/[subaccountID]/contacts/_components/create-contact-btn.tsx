'use client';
import React from 'react';

import SendInvitation from '@/components/forms/send-invitation';
import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import { useModal } from '@/providers/modal-provider';

type Props = {
  subaccountId: string;
};

const CreateContactButton = ({ subaccountId }: Props) => {
  const { setOpen } = useModal();

  const handleCreateContact = async () => {
    setOpen(
      <CustomModal
        title="Add a contact"
        subheading="Contacts are like members."
      >
        {/* <ContactUserForm subaccountId={subaccountId} /> */}
        <SendInvitation subaccountId={subaccountId} />
      </CustomModal>,
    );
  };

  return <Button onClick={handleCreateContact}>Create Contact</Button>;
};

export default CreateContactButton;
