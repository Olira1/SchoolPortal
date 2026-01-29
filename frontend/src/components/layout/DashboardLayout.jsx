// Dashboard Layout Component
// Main wrapper for all authenticated pages
// Includes Sidebar, Header, and content area

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * DashboardLayout Component
 * Provides the main layout structure for all dashboard pages
 */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 text-center text-sm text-gray-400 border-t border-gray-200 bg-white">
          © 2026 SchoolPortal. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;

