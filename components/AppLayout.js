'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // If on login page, render clean full-page view without sidebar and navbar
  if (isLoginPage) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column justify-content-center">
        {children}
      </div>
    );
  }

  // Inside dashboard and internal authenticated pages: render Navbar and Sidebar
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container-fluid flex-grow-1 p-0">
        <div className="row g-0">
          <div className="col-12 col-md-3 col-lg-2">
            <Sidebar />
          </div>
          <main className="col-12 col-md-9 col-lg-10 p-3 p-md-4 main-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
