
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { getCachedLoggedInVerifiedUser } from '@/rsc-data/auth';
import Link from 'next/link';
import { Suspense } from 'react';
import { AppSidebarContent } from './app-sidebar-client';

async function SidebarHeaderContent() {
  'use cache'
  return <SidebarHeader className="p-4 sm:p-6">
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild className="bg-transparent hover:bg-transparent">
          <Link href="/dashboard" className="flex items-center">
            <span className="truncate font-semibold text-white dark:text-white text-black text-lg" style={{ fontFamily: "'Oceanwide Pro', sans-serif" }}>photon</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>
}



async function SidebarContentWrapper() {
  const { user } = await getCachedLoggedInVerifiedUser();
  return <AppSidebarContent user={user as any} />
}


export async function AppSidebar() {
  return (
    <Sidebar 
      variant="inset" 
      collapsible="icon"
      className="dashboard-sidebar bg-[var(--dashboard-background-light)] border-r border-white/10"
    >
      <SidebarHeaderContent />
      <Suspense fallback={null}>
        <SidebarContentWrapper />
      </Suspense>
    </Sidebar>
  );
}
