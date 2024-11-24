'use client';

import type {
  Role,
} from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import UserDetails from '@/components/forms/user-details';
import CustomModal from '@/components/global/custom-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { roles } from '@/constants/global-constants';
import { useToast } from '@/hooks/use-toast';
import { deleteUser, getUser } from '@/lib/queries/user-queries';
import { useModal } from '@/providers/modal-provider';
import type { SubAccountContacts, UsersWithAgencySubAccountPermissions } from '@/types/global-types';

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const { setOpen } = useModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  if (!rowData) {
    return;
  }

  if (!rowData.Agency && !rowData.Permissions) {
    return;
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="size-8 p-0"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => navigator.clipboard.writeText(rowData?.email)}
          >
            <Copy size={15} />
            {' '}
            Copy Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                <CustomModal
                  subheading="You can change permissions only when the user has an owned subaccount"
                  title="Edit User Details"
                >
                  <UserDetails
                    type="agency"
                    id={rowData?.Agency?.id || null}
                    subAccounts={rowData?.Agency?.SubAccount}
                  />
                </CustomModal>,
                async () => {
                  return { user: await getUser(rowData?.id) };
                },
              );
            }}
          >
            <Edit size={15} />
            Edit Details
          </DropdownMenuItem>
          {rowData.role !== 'AGENCY_OWNER' && (
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="flex gap-2"
                onClick={() => {}}
              >
                <Trash size={15} />
                {' '}
                Remove User
              </DropdownMenuItem>
            </AlertDialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the user
            and related data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive"
            onClick={async () => {
              setLoading(true);
              await deleteUser(rowData.id);
              toast({
                title: 'Deleted User',
                description:
                  'The user has been deleted from this agency they no longer have access to the agency',
              });
              setLoading(false);
              router.refresh();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const columns: ColumnDef<UsersWithAgencySubAccountPermissions>[]
  = [
    {
      accessorKey: 'id',
      header: '',
      cell: () => {
        return null;
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const avatarUrl = row.getValue('avatarUrl') as string;
        return (
          <div className="flex items-center gap-4">
            <div className="relative size-11 flex-none">
              <Image
                src={avatarUrl}
                fill
                className="rounded-full object-cover"
                alt="avatar image"
              />
            </div>
            <span>{row.getValue('name')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'avatarUrl',
      header: '',
      cell: () => {
        return null;
      },
    },
    { accessorKey: 'email', header: 'Email' },

    // {
    //   accessorKey: 'SubAccount',
    //   header: 'Owned Accounts',
    //   cell: ({ row }) => {
    //     const isAgencyOwner = row.getValue('role') === roles.AGENCY_OWNER;
    //     const rowOriginal = row.original;
    //     const ownedAccounts: { id: string; SubAccount: { name: string } }[] = rowOriginal?.Permissions.filter(
    //       (per: { access: boolean }) => per.access,
    //     );

    //     if (isAgencyOwner) {
    //       return (
    //         <div className="flex flex-col items-start">
    //           <div className="flex flex-col gap-2">
    //             <Badge className="whitespace-nowrap bg-slate-600">
    //               Agency -
    //               {' '}
    //               {row?.original?.Agency?.name}
    //             </Badge>
    //           </div>
    //         </div>
    //       );
    //     }
    //     return (
    //       <div className="flex flex-col items-start">
    //         <div className="flex flex-col gap-2">
    //           {ownedAccounts?.length
    //             ? (
    //                 ownedAccounts.map(account => (
    //                   <Badge
    //                     key={account.id}
    //                     className="w-fit whitespace-nowrap bg-slate-600"
    //                   >
    //                     Sub Account -
    //                     {' '}
    //                     {account.SubAccount.name}
    //                   </Badge>
    //                 ))
    //               )
    //             : (
    //                 <div className="text-muted-foreground">No Access Yet</div>
    //               )}
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role: Role = row.getValue('role');
        return (
          <Badge
            className={clsx({
              'bg-emerald-500': role === roles.AGENCY_OWNER,
              'bg-orange-400': role === roles.AGENCY_ADMIN,
              'bg-primary': role === roles.SUB_ACCOUNT_USER,
              'bg-muted': role === roles.SUB_ACCOUNT_GUEST,
            })}
          >
            {role}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const rowData = row.original;

        return <CellActions rowData={rowData} />;
      },
    },
  ];

type CellActionsProps = {
  rowData: SubAccountContacts;
};
