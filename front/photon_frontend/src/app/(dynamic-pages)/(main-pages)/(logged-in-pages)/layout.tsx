import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { getCachedIsUserLoggedIn } from '@/rsc-data/auth';
import { redirect } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import { AppSidebar } from './app-sidebar';
import { DashboardHeader } from '@/components/Layout/DashboardHeader';
import '@/styles/dashboard.css';

async function AuthGuard({ children }: { children: ReactNode }) {
  const isLoggedIn = await getCachedIsUserLoggedIn();
  if (!isLoggedIn) {
    redirect('/login');
  }
  return <>{children}</>;
}

export default async function Layout({
  children,
  heading,
}: {
  children: ReactNode;
  heading: ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AuthGuard>
        <div className="dashboard-layout">
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen bg-[var(--dashboard-background)]">
              <DashboardHeader heading={heading} />
              <div className="flex-1">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </AuthGuard>
    </Suspense>
  );
}
