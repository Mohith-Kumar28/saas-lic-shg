import { UserButton } from '@clerk/nextjs';
import React from 'react';

import { urls } from '@/constants/global-constants';

const UserAccountButton = () => {
  return (
    <UserButton afterSignOutUrl={urls.HOME} />
  );
};

export default UserAccountButton;
