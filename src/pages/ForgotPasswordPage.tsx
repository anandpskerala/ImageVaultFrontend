import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '@/components/partials/NavBar';
import { useAppSelector, type RootState } from '@/store';
import { forgotPasswordService } from '@/services/passwordService';

interface FormState {
    email: string;
    isSubmitting: boolean;
    isSubmitted: boolean;
    error: string;
}

const ForgotPasswordPage: React.FC = () => {
    const [form, setForm] = useState<FormState>({
        email: '',
        isSubmitting: false,
        isSubmitted: false,
        error: ''
    });
    const navigate = useNavigate();
    const { user } = useAppSelector((state: RootState) => state.auth);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            email: e.target.value,
            error: ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.email.trim()) {
            setForm(prev => ({ ...prev, error: 'Email address is required' }));
            return;
        }

        if (!validateEmail(form.email)) {
            setForm(prev => ({ ...prev, error: 'Please enter a valid email address' }));
            return;
        }

        setForm(prev => ({ ...prev, isSubmitting: true, error: '' }));

        try {
            await forgotPasswordService(form.email);
            setForm(prev => ({
                ...prev,
                isSubmitting: false,
                isSubmitted: true
            }));
        } catch (error) {
            console.error(error)
            setForm(prev => ({
                ...prev,
                isSubmitting: false,
                error: 'Something went wrong. Please try again.'
            }));
        }
    };

    const handleBackToLogin = () => {
        navigate("/login");
    };

    const handleResendEmail = () => {
        setForm(prev => ({ ...prev, isSubmitted: false }));
    };

    if (form.isSubmitted) {
        return (
            <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <NavBar user={user} />
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-semibold text-gray-900">Check your email</CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                We've sent a password reset link to <strong className="text-gray-900">{form.email}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert className="border-blue-200 bg-blue-50/50">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-700">
                                    Didn't receive the email? Check your spam folder or try again.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-3 pt-2">
                            <Button
                                onClick={handleResendEmail}
                                variant="outline"
                                className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                                disabled={form.isSubmitting}
                            >
                                {form.isSubmitting ? 'Sending...' : 'Resend email'}
                            </Button>
                            <Button
                                onClick={handleBackToLogin}
                                variant="ghost"
                                className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to login
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <NavBar user={user} />
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-semibold text-gray-900">Forgot your password?</CardTitle>
                        <CardDescription className="text-gray-600 mt-2">
                            No worries! Enter your email address and we'll send you a link to reset your password.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5">
                            {form.error && (
                                <Alert variant="destructive" className="border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-700">{form.error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={form.email}
                                    onChange={handleEmailChange}
                                    disabled={form.isSubmitting}
                                    className="w-full h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-2 transition-colors"
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-3 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 bg-black hover:bg-white hover:text-black border border-black focus:ring-2 focus:ring-blue-500/20 transition-colors font-medium cursor-pointer"
                                disabled={form.isSubmitting}
                            >
                                {form.isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Sending reset link...
                                    </>
                                ) : (
                                    'Send reset link'
                                )}
                            </Button>

                            <Button
                                type="button"
                                onClick={handleBackToLogin}
                                variant="ghost"
                                className="w-full h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                                disabled={form.isSubmitting}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to login
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;