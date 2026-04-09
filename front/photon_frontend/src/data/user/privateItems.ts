'use server';
import { authActionClient } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const insertPrivateItemSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const insertPrivateItemAction = authActionClient
  .schema(insertPrivateItemSchema)
  .action(async ({ parsedInput }) => {
    revalidatePath('/');
    return 'item-id-' + Date.now();
  });

const deletePrivateItemSchema = z.object({
  id: z.string().uuid(),
});

export const deletePrivateItemAction = authActionClient
  .schema(deletePrivateItemSchema)
  .action(async ({ parsedInput }) => {
    revalidatePath('/');
    redirect('/private-items');
    return { success: true };
  });
