import { lazy } from 'react'
import { RouteObject } from 'react-router-dom';

const MyRequests = lazy(() => import('../../../modules/my-requests'));
const RequestDetail = lazy(() => import('../../../modules/my-requests/RequestDetail'));

export const myRequestRoutes: RouteObject[] = [
    {
        path: '/my-requests',
        element: <MyRequests />,
    },
    {
        path: '/my-requests/:submissionId',
        element: <RequestDetail />,
    },
];
