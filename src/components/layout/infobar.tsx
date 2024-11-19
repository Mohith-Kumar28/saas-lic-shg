'use client';
import type { Role } from '@prisma/client';
import { BellIcon } from 'lucide-react';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { roles } from '@/constants/global-constants';
import type { NotificationWithUser } from '@/types/global-types';

// import type { NotificationWithUser } from '@/lib/types';
import { ModeToggle } from '../global/mode-toggle';
import UserAccountButton from '../molecules/user-account-button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card } from '../ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Switch } from '../ui/switch';

type Props = {
  notifications: NotificationWithUser | [];
  role?: Role;
  className?: string;
  subAccountId?: string;
};

const InfoBar = ({ notifications, subAccountId, className, role }: Props) => {
  const [allNotifications, setAllNotifications] = useState(notifications);
  const [showAll, setShowAll] = useState(true);

  const handleClick = () => {
    if (!showAll) {
      setAllNotifications(notifications);
    } else {
      if (notifications?.length !== 0) {
        setAllNotifications(
          notifications?.filter(item => item.subAccountId === subAccountId)
          ?? [],
        );
      }
    }
    setShowAll(prev => !prev);
  };

  return (
    <div>
      <div
        className={twMerge(
          'fixed z-[20] md:left-[300px] left-0 right-0 top-0 p-4 bg-background/80 backdrop-blur-md flex  gap-4 items-center border-b-[1px] ',
          className,
        )}
      >
        <div className="ml-auto flex items-center gap-2">
          <UserAccountButton />
          <Sheet>
            <SheetTrigger>
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
                <BellIcon size={17} />
              </div>
            </SheetTrigger>
            <SheetContent className="mr-4 mt-4 overflow-scroll pr-4">
              <SheetHeader className="text-left">
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  {(role === roles.AGENCY_ADMIN || roles.AGENCY_OWNER) && (
                    <Card className="flex items-center justify-between p-4">
                      Current Subaccount
                      <Switch onCheckedChange={handleClick} />
                    </Card>
                  )}
                </SheetDescription>
              </SheetHeader>
              <div

                className="my-6  flex flex-col gap-y-6 overflow-x-scroll text-ellipsis"
              >
                {allNotifications?.map(notification => (
                  <div key={notification.id} className="flex gap-2">
                    <Avatar>
                      <AvatarImage
                        src={notification.User.avatarUrl}
                        alt="Profile Picture"
                      />
                      <AvatarFallback className="bg-primary">
                        {notification.User.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p>
                        <span className="font-bold">
                          {notification.notification.split('|')[0]}
                        </span>
                        <span className="text-muted-foreground">
                          {notification.notification.split('|')[1]}
                        </span>
                        <span className="font-bold">
                          {notification.notification.split('|')[2]}
                        </span>
                      </p>
                      <small className="text-xs text-muted-foreground">

                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              {allNotifications?.length === 0 && (
                <div
                  className="flex items-center justify-center text-muted-foreground"
                  mb-4
                >
                  You have no notifications
                </div>
              )}
            </SheetContent>
          </Sheet>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

export default InfoBar;
