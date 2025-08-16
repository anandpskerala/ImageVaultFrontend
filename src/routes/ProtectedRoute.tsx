import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import type { RouterProps } from '@/interfaces/props/RouterProps';


export const ProtectedRoute: React.FC<RouterProps> = ({user}) => {
    if (user === undefined) {
        return null;
    }

    if (!user?.id) {
        return <Navigate to="/login" replace />
    }
    return <Outlet />
}