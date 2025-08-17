import { useAppSelector, type RootState } from '@/store';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthRedirect } from '@/routes/AuthRedirect';
import { ProtectedRoute } from './ProtectedRoute';

const AppRoutes = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);

    const LoginPage = lazy(() => import("@/pages/LoginPage"));
    const HomePage = lazy(() => import("@/pages/HomePage"));
    const SignupPage = lazy(() => import("@/pages/SignupPage"));
    const UserProfilePage = lazy(() => import("@/pages/UserProfilePage"));
    const UploadPage = lazy(() => import("@/pages/UploadPage"));
    const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
    const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
    
    return (
        <Suspense fallback={<span>Loading...</span>}>
            <Routes>
                <Route element={<AuthRedirect user={user}/>}>
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/signup' element={<SignupPage />} />
                    <Route path='/forgot-password' element={<ForgotPasswordPage />} />
                    <Route path='/reset-password/:id' element={<ResetPasswordPage />} />
                </Route>

                <Route element={<ProtectedRoute user={user} />}>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/settings' element={<UserProfilePage />} />
                    <Route path='/upload' element={<UploadPage />} />
                </Route>
            </Routes>
        </Suspense>
    )
}

export default AppRoutes