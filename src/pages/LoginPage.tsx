import React, { useState, type ChangeEvent } from 'react';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Alert,
    AlertDescription,
} from '@/components/ui/alert';
import type { LoginDataPayload } from '@/interfaces/entities/Payload';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { loginUser } from '@/store/actions/auth/loginUser';
import { Link } from 'react-router-dom';
import { NavBar } from '@/components/partials/NavBar';
import { useAppSelector, type RootState } from '@/store';


interface ValidationErrors {
    emailOrPhone?: string;
    password?: string;
}

type FormField = keyof LoginDataPayload;

const loginSchema = yup.object().shape({
    emailOrPhone: yup
        .string()
        .trim()
        .required('Email or phone is required'),
    password: yup
        .string()
        .trim()
        .required('Password is required'),
});

const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [formData, setFormData] = useState<LoginDataPayload>({
        emailOrPhone: '',
        password: ''
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [submitError, setSubmitError] = useState<string>('');
    const dispatch = useAppDispatch();
    const {user} = useAppSelector((state: RootState) => state.auth);

    const validateField = async (field: FormField, value: string): Promise<void> => {
        try {
            await loginSchema.pick([field]).validate({ [field]: value });
            setErrors(prev => ({ ...prev, [field]: '' }));
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                setErrors(prev => ({ ...prev, [field]: error.message }));
            }
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        const fieldName = name as FormField;

        setFormData(prev => ({ ...prev, [fieldName]: value }));
        validateField(fieldName, value);
        setSubmitError('');
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setSubmitError('');
            await loginSchema.validate(formData, { abortEarly: false });
            setErrors({});
            const res = await dispatch(loginUser(formData));
            if (res.meta.requestStatus === 'rejected') {
                setSubmitError(res.payload);
            }
        } catch (validationErrors) {
            if (validationErrors instanceof yup.ValidationError && validationErrors.inner) {
                const errorMap: ValidationErrors = {};
                validationErrors.inner.forEach((error: yup.ValidationError) => {
                    if (error.path) {
                        errorMap[error.path as FormField] = error.message;
                    }
                });
                setErrors(errorMap);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (): void => {
        setShowPassword(!showPassword);
    };

    const handleRememberMeChange = (checked: boolean): void => {
        setRememberMe(checked);
    };

    return (
        <div className="flex flex-col w-full">
            <NavBar user={user} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
                <div className="w-full md:max-w-2xl">
                    <Card className="shadow-2xl w-full border-0 bg-white/80 backdrop-blur-sm px-0 md:px-4">
                        <CardHeader className="text-center space-y-4 pb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                                    Welcome back
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Sign in to your account to continue your journey
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {submitError && (
                                <Alert className="border-red-200 bg-red-50 flex justify-center">
                                    <AlertDescription className="text-red-800 flex flex-row flex-wrap gap-2">
                                        <AlertCircle className="w-5 h-5" /> <span>{submitError}</span>
                                    </AlertDescription>
                                </Alert>
                            )}
                            <form onSubmit={handleSubmit}>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                        Email or phone
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="emailOrPhone"
                                            name="emailOrPhone"
                                            type="email"
                                            placeholder="Enter your email or phone"
                                            className={`pl-10 h-11 ${errors.emailOrPhone ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-300'}`}
                                            value={formData.emailOrPhone}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {errors.emailOrPhone && (
                                        <p className="text-sm text-red-600 font-medium">{errors.emailOrPhone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className={`pl-10 pr-10 h-11 ${errors.password ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-300'}`}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={togglePasswordVisibility}
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-slate-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-slate-400" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600 font-medium">{errors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={rememberMe}
                                            onCheckedChange={handleRememberMeChange}
                                            disabled={isLoading}
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm text-slate-600 cursor-pointer"
                                        >
                                            Remember me
                                        </Label>
                                    </div>
                                    <Button
                                        variant="link"
                                        type="button"
                                        className="px-0 text-sm text-slate-600 hover:text-slate-900"
                                        disabled={isLoading}
                                    >
                                        Forgot password?
                                    </Button>
                                </div>

                                <Button
                                    className={`w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium ${isLoading ? 'cursor-not-allowed': 'cursor-pointer'}`}
                                    type='submit'
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>
                            </div>
                            </form>
                        </CardContent>

                        <CardFooter className="justify-center pb-8">
                            <p className="text-sm text-slate-600">
                                Don't have an account?{' '}
                                <Link to={'/signup'} className="px-0 text-slate-900 hover:text-slate-700 font-medium">
                                    Sign up for free
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>

                    <div className="text-center text-xs text-slate-500 mt-6 space-x-1">
                        <span>By signing in, you agree to our</span>
                        <Button variant="link" className="px-0 text-xs h-auto text-slate-500 hover:text-slate-700">
                            Terms of Service
                        </Button>
                        <span>and</span>
                        <Button variant="link" className="px-0 text-xs h-auto text-slate-500 hover:text-slate-700">
                            Privacy Policy
                        </Button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default LoginPage;