'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Member } from '@prisma/client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import * as z from 'zod';

import Loading from '@/components/global/loading';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { upsertMember } from '@/lib/queries/member-queries';
import { saveActivityLogsNotification } from '@/lib/queries/user-queries';

const formSchema = z.object({
  email: z.string(),
  name: z.string(),
  phone: z.string().min(1),
  address: z.string(),
  city: z.string(),
  subAccountLogo: z.string().optional(),
  zipCode: z.string(),
  state: z.string(),
  country: z.string(),
});

type MemberDetailsProps = {
  // To add the sub account to the agency
  subAccountId: string;
  email: string;
  details?: Partial<Member>;

};

const MemberDetails: React.FC<MemberDetailsProps> = ({
  details,
  subAccountId,
  email,

}) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email,
      name: details?.name,
      phone: details?.phone,
      address: details?.address,
      city: details?.city,
      zipCode: details?.zipCode,
      state: details?.state,
      country: details?.country,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await upsertMember({
        id: details?.id ? details.id : v4(),
        address: values.address,
        name: values.name,
        city: values.city,
        country: values.country,
        state: values.state,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        email,
        phone: values?.phone,
        subAccountId,
        connectAccountId: '',

      });
      if (!response) {
        throw new Error('No response from server');
      }
      await saveActivityLogsNotification({
        description: `updated member account | ${response.email}`,
        subaccountId: response.subAccountId,
      });

      toast({
        title: ' details saved',
        description: 'Successfully saved your details.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: `Could not save account details : ${error}`,
      });
    }
  }

  useEffect(() => {
    if (details) {
      form.reset(details);
    }
  }, [details, form]);

  const isLoading = form.formState.isSubmitting;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Member</CardTitle>
        <CardDescription>Please enter your details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* <FormField
              disabled={isLoading}
              control={form.control}
              name="subAccountLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Logo</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <div className="flex gap-4 md:flex-row">

              <FormField
                disabled={isLoading}
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel> Email</FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        placeholder="Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Official Name</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Name as per ID"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-4 md:flex-row">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel> Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Phone"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="123 st..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 md:flex-row">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="City"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="State"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Zipcpde</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Zipcode"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="Country"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Loading /> : 'Save Account Information'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MemberDetails;
