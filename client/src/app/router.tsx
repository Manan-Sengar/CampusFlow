import { createBrowserRouter } from 'react-router-dom'
import { HomeRedirect } from '../auth/HomeRedirect.tsx'
import { RequireAuth } from '../auth/RequireAuth.tsx'
import { RequireGuest } from '../auth/RequireGuest.tsx'
import { AppShell } from '../layouts/AppShell.tsx'
import { AuthLayout } from '../layouts/AuthLayout.tsx'
import { ClubLayout } from '../layouts/ClubLayout.tsx'
import { ClubOverviewPage } from '../pages/ClubOverviewPage.tsx'
import { ApplyPage } from '../pages/ApplyPage.tsx'
import { ClubsPage } from '../pages/ClubsPage.tsx'
import { EventsPage } from '../pages/EventsPage.tsx'
import { EventDetailPage } from '../pages/EventDetailPage.tsx'
import { LoginPage } from '../pages/LoginPage.tsx'
import { MembersPage } from '../pages/MembersPage.tsx'
import { NotFoundPage } from '../pages/NotFoundPage.tsx'
import { RegisterPage } from '../pages/RegisterPage.tsx'
import { RecruitmentPage } from '../pages/RecruitmentPage.tsx'
import { RecruitmentDrivePage } from '../pages/RecruitmentDrivePage.tsx'
import { TeamsPage } from '../pages/TeamsPage.tsx'

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
        children: [
          { path: '/clubs', element: <ClubsPage /> },
          { path: '/apply/:clubId/:driveId', element: <ApplyPage /> },
          {
            path: '/clubs/:clubId',
            element: <ClubLayout />,
            children: [
              { index: true, element: <ClubOverviewPage /> },
              { path: 'members', element: <MembersPage /> },
              { path: 'teams', element: <TeamsPage /> },
              { path: 'events', element: <EventsPage /> },
              { path: 'events/:eventId', element: <EventDetailPage /> },
              { path: 'recruitment', element: <RecruitmentPage /> },
              { path: 'recruitment/:driveId', element: <RecruitmentDrivePage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
