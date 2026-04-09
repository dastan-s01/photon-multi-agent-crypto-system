'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { signOutAction } from "@/data/auth/sign-out";
import { User } from "@/rsc-data/auth";
import { ChevronUp, Home, LogOut, Settings, Wallet, Users, BarChart3, Cog, Target, Database, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
const navigationItems: { title: string; url: string; icon: React.ElementType }[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Portfolio',
    url: '/portfolio',
    icon: Wallet,
  },
  {
    title: 'Agents',
    url: '/agents',
    icon: Users,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Decisions',
    url: '/decisions',
    icon: Target,
  },
  {
    title: 'Market Data',
    url: '/market-data',
    icon: Database,
  },
  {
    title: 'Crypto Dashboard',
    url: '/crypto-dashboard',
    icon: TrendingUp,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Cog,
  },
];



export function AppSidebarContent({ user }: { user: User }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
    });
  }

  const userEmail = user?.email || 'user@example.com';
  const userName = (user as any)?.full_name || user.email?.split('@')[0] || 'User';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return <><SidebarContent className="px-4 sm:px-6">
    <SidebarGroup>
      <SidebarGroupLabel className="text-white/50 dark:text-white/50 text-black/50 text-xs font-medium uppercase tracking-wider px-4 mb-2">Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.url;
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={false}
                  className="flex items-center space-x-4 sm:space-x-6 rounded-none px-4 sm:px-5 py-3 text-sm font-medium transition-colors border-transparent text-white/70 dark:text-white/70 text-black/70 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 hover:text-white dark:hover:text-white hover:text-black"
                >
                  <Link href={item.url} className="flex items-center space-x-4 sm:space-x-6 w-full">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
    <SidebarFooter className="px-4 sm:px-6 pb-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-white/5 dark:data-[state=open]:bg-white/5 data-[state=open]:bg-black/5 data-[state=open]:text-white dark:data-[state=open]:text-white data-[state=open]:text-black bg-transparent hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 text-white dark:text-white text-black border-0"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-[#1a1a1a] dark:bg-[#1a1a1a] bg-[#e9ecef] text-white dark:text-white text-black">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white dark:text-white text-black">{userName}</span>
                  <span className="truncate text-xs text-white/50 dark:text-white/50 text-black/50">
                    {userEmail}
                  </span>
                </div>
                <ChevronUp className="ml-auto size-4 text-white/50 dark:text-white/50 text-black/50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-[#151515] dark:bg-[#151515] bg-white border border-white/10 dark:border-white/10 border-black/10 shadow-lg"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-[#1a1a1a] dark:bg-[#1a1a1a] bg-[#e9ecef] text-white dark:text-white text-black">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white dark:text-white text-black">{userName}</span>
                    <span className="truncate text-xs text-white/50 dark:text-white/50 text-black/50">
                      {userEmail}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10 dark:bg-white/10 bg-black/10" />
              <DropdownMenuItem asChild className="text-white dark:text-white text-black hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 focus:bg-white/5 dark:focus:bg-white/5 focus:bg-black/5">
                <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10 dark:bg-white/10 bg-black/10" />
              <DropdownMenuItem onClick={handleSignOut} disabled={isPending} className="text-white dark:text-white text-black hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 focus:bg-white/5 dark:focus:bg-white/5 focus:bg-black/5">
                <LogOut className="mr-2 h-4 w-4" />
                {isPending ? 'Signing out...' : 'Sign out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </>

}
