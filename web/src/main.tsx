import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow/700.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';
import '@fontsource/barlow-condensed/800-italic.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { RequireRole } from './auth/RequireRole.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { ToastProvider } from './components/toast/ToastProvider.tsx';
import { AdminPage } from './pages/admin/AdminPage.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegisterPage } from './pages/auth/RegisterPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { VenueDetailPage } from './pages/venue/VenueDetailPage.tsx';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/cari', element: <SearchPage /> },
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
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
);
