import { createBrowserRouter } from 'react-router-dom'
import { HomeRedirect } from '../auth/HomeRedirect.tsx'
import { RequireAuth } from '../auth/RequireAuth.tsx'
import { RequireGuest } from '../auth/RequireGuest.tsx'
import { AppShell } from '../layouts/AppShell.tsx'
import { AuthLayout } from '../layouts/AuthLayout.tsx'
import { ClubsPage } from '../pages/ClubsPage.tsx'
import { LoginPage } from '../pages/LoginPage.tsx'
import { NotFoundPage } from '../pages/NotFoundPage.tsx'
import { RegisterPage } from '../pages/RegisterPage.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeRedirect />,
  },
  {
    element: <RequireGuest />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [{ path: '/clubs', element: <ClubsPage /> }],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
