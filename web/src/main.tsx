import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { ActiveBookingsProvider } from './bookings/ActiveBookingsProvider.tsx';
import { ComparePage } from './compare/ComparePage.tsx';
import { CompareProvider } from './compare/CompareProvider.tsx';
import { ThemeProvider } from './theme/ThemeProvider.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { RequireRole } from './auth/RequireRole.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { ToastProvider } from './components/toast/ToastProvider.tsx';
import { AdminPage } from './pages/admin/AdminPage.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegisterPage } from './pages/auth/RegisterPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { VenueDetailPage } from './pages/venue/VenueDetailPage.tsx';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <SearchPage /> },
      { path: '/cari', element: <SearchPage /> },
      { path: '/bandingkan', element: <ComparePage /> },
      { path: '/lapangan/:id', element: <VenueDetailPage /> },
      { path: '/masuk', element: <LoginPage /> },
      { path: '/daftar', element: <RegisterPage /> },
      {
        path: '/booking/:id/bayar',
        element: (
          <RequireRole roles={['penyewa']}>
            <CheckoutPage />
          </RequireRole>
        ),
      },
      {
        path: '/riwayat',
        element: (
          <RequireRole roles={['penyewa']}>
            <HistoryPage />
          </RequireRole>
        ),
      },
      {
        path: '/profil',
        element: (
          <RequireRole>
            <ProfilePage />
          </RequireRole>
        ),
      },
      {
        path: '/pemilik',
        element: (
          <RequireRole roles={['pemilik']}>
            <OwnerDashboardPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin',
        element: (
          <RequireRole roles={['admin']}>
            <AdminPage />
          </RequireRole>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Elemen #root tidak ditemukan di index.html');

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ActiveBookingsProvider>
            <CompareProvider>
              <RouterProvider router={router} />
            </CompareProvider>
          </ActiveBookingsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
