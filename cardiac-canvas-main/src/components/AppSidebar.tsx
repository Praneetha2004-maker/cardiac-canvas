import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from '@/components/ui/sidebar';
import { Activity, BarChart2, Globe, User, HeartPulse } from 'lucide-react';

const navItems = [
  { title: 'Overview', url: '/overview', icon: BarChart2, description: 'Summary & trends' },
  { title: 'Clinical View', url: '/clinical', icon: Activity, description: 'Dr. Sharma' },
  { title: 'Policy View', url: '/policy', icon: Globe, description: 'Ramesh' },
  { title: 'Patient Profile', url: '/patient', icon: User, description: 'Anita' },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
            <HeartPulse className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-sidebar-foreground leading-none">CardioInsight</p>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">Heart Disease Analysis</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <div className="group-data-[collapsible=icon]:hidden">
                          <span className="text-sm font-medium">{item.title}</span>
                          <p className="text-xs opacity-60">{item.description}</p>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">
          Clinical Decision Support
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
