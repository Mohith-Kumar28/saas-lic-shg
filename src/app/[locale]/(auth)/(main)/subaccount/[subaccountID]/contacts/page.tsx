import type { Ticket } from '@prisma/client';
import { format } from 'date-fns/format';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getSubaccountContacts } from '@/lib/queries/sub-account-queries';

import CreateContactButton from './_components/create-contact-btn';

type Props = {
  params: { subaccountId: string };
};

const ContactPage = async ({ params }: Props) => {
  const contacts = await getSubaccountContacts(params.subaccountId);

  const allContacts = contacts?.Contact ?? [];

  const formatTotal = (tickets: Ticket[]) => {
    if (!tickets || !tickets.length) {
      return '$0.00';
    }
    const amt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
    });

    const laneAmt = tickets.reduce(
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0,
    );

    return amt.format(laneAmt);
  };
  return (
    <section>
      <h1 className="p-4 text-4xl">Contacts</h1>
      <CreateContactButton subaccountId={params.subaccountId} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[300px]">Email</TableHead>
            <TableHead className="w-[200px]">Active</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Amount Required</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="truncate font-medium">
          {allContacts.map(contact => (
            <TableRow key={contact.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage alt="@shadcn" />
                  <AvatarFallback className="bg-primary text-white">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                {formatTotal(contact.Ticket) === '$0.00'
                  ? (
                      <Badge variant="destructive">Inactive</Badge>
                    )
                  : (
                      <Badge className="bg-emerald-700">Active</Badge>
                    )}
              </TableCell>
              <TableCell>{format(contact.createdAt, 'MM/dd/yyyy')}</TableCell>
              <TableCell className="text-right">
                {formatTotal(contact.Ticket)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
};

export default ContactPage;
