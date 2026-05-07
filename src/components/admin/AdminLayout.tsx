import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';

export const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div
        className={cn(
          'flex flex-col transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'ml-[70px]' : 'ml-[260px]'
        )}
      >
        <AdminTopBar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
