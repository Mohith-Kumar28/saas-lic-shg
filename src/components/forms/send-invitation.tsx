'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { roles } from '@/constants/global-constants';
import { useToast } from '@/hooks/use-toast';
import { saveActivityLogsNotification, sendInvitation } from '@/lib/queries/user-queries';

import Loading from '../global/loading';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

type SendInvitationProps = {
  agencyId?: string;
  subaccountId?: string;
};

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId, subaccountId }) => {
  const { toast } = useToast();
  const userDataSchema = z.object({
    email: z.string().email(),
    role: z.enum([roles.AGENCY_ADMIN, roles.SUB_ACCOUNT_USER, roles.SUB_ACCOUNT_GUEST]),
  });

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: roles.SUB_ACCOUNT_GUEST,
    },
  });

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    try {
      const res = await sendInvitation({ role: values.role, email: values.email, agencyId, subaccountId });
      await saveActivityLogsNotification({
        agencyId,
        description: `Sent invitation to ${res.email}`,
        subaccountId,
      });

      toast({
        title: 'Success',
        description: 'Created and sent invitation',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'Could not send invitation | Invitation already sent',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation</CardTitle>
        <CardDescription>
          An invitation will be sent to the user. Users who already have an
          invitation sent out to their email, will not receive another
          invitation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User role</FormLabel>
                  <Select
                    onValueChange={value => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={roles.AGENCY_ADMIN}>Agency Admin</SelectItem>
                      <SelectItem value={roles.SUB_ACCOUNT_USER}>
                        Sub Account User
                      </SelectItem>
                      <SelectItem value={roles.SUB_ACCOUNT_GUEST}>
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Send Invitation'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SendInvitation;
