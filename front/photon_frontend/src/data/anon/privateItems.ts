'use server';
import { Table } from '@/types';

export const getUserPrivateItems = async (): Promise<
  Array<Table<'private_items'>>
> => {
  return [];
};

export const getPrivateItem = async (
  id: string
): Promise<Table<'private_items'>> => {
  throw new Error('Item not found');
};
