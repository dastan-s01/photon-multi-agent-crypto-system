'use server';

import { clearServerAuthTokens } from '@/utils/jwt-tokens.server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signOutAction() {
    await clearServerAuthTokens();
    
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    revalidatePath('/', 'layout');
    redirect('/login');
}
