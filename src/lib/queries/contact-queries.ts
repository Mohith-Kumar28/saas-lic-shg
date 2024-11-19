'use server';
import type {
  Prisma,
} from '@prisma/client';
import { v4 } from 'uuid';

import { db } from '../DB';

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput,
) => {
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: contact,
    create: contact,
  });
  return response;
};
