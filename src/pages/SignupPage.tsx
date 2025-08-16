import React, { useState, type ChangeEvent } from 'react';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User, Phone } from 'lucide-react';

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
import { Link } from 'react-router-dom';
import { NavBar } from '@/components/partials/NavBar';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector, type RootState } from '@/store';
import type { SignupDataPayload } from '@/interfaces/entities/Payload';
import { signupUser } from '@/store/actions/auth/signupUser';
import { getPasswordStrength } from '@/utils/stringUtils';


interface ValidationErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
}

type FormField = keyof SignupDataPayload | 'confirmPassword';

const signupSchema = yup.object().shape({
    firstName: yup
        .string()
        .trim()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters'),
    lastName: yup
        .string()
        .trim()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters'),
    email: yup
        .string()
        .trim()
        .email('Please enter a valid email address')
        .required('Email is required'),
    phone: yup
        .string()
        .trim()
        .required('Phone number is required')
        .matches(/^[+]?[\d\s\-()]+$/, 'Please enter a valid phone number'),
    password: yup
        .string()
        .trim()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: yup
        .string()
        .trim()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match'),
});

const SignupPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
    const [formData, setFormData] = useState<SignupDataPayload & { confirmPassword: string }>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [submitError, setSubmitError] = useState<string>('');
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: RootState) => state.auth);

    const validateField = async (field: FormField, value: string): Promise<void> => {
        try {
            if (field === 'confirmPassword') {
                await signupSchema.pick(['password', 'confirmPassword']).validate({
                    password: formData.password,
                    confirmPassword: value
                });
            } else {
                await signupSchema.pick([field]).validate({ [field]: value });
            }
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

        if (!agreeToTerms) {
            setSubmitError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        try {
            setIsLoading(true);
            setSubmitError('');
            await signupSchema.validate(formData, { abortEarly: false });
            setErrors({});

            const res = await dispatch(signupUser(formData));
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

    const toggleConfirmPasswordVisibility = (): void => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleAgreeToTermsChange = (checked: boolean): void => {
        setAgreeToTerms(checked);
        if (checked) {
            setSubmitError('');
        }
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="flex flex-col w-full">
            <NavBar user={user} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
                <div className="w-full md:max-w-2xl">
                    <Card className="shadow-2xl w-full border-0 bg-white/80 backdrop-blur-sm px-0 md:px-4">
                        <CardHeader className="text-center space-y-4 pb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                                    Create your account
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Join us today and start your journey with us
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                                                First Name
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    type="text"
                                                    placeholder="Enter your first name"
                                                    className={`pl-10 h-11 ${errors.firstName ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-300'}`}
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            {errors.firstName && (
                                                <p className="text-sm text-red-600 font-medium">{errors.firstName}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                                                Last Name
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    type="text"
                                                    placeholder="Enter your last name"
                                                    className={`pl-10 h-11 ${errors.lastName ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-300'}`}
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            {errors.lastName && (
                                                <p className="text-sm text-red-600 font-medium">{errors.lastName}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter your email address"
                                                className={`pl-10 h-11 ${errors.email ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-300'}`}
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-red-600 font-medium">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                                            Phone Number
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="Enter your phone number"
                                                className={`pl-10 h-11 ${errors.phone ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-300'}`}
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 font-medium">{errors.phone}</p>
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
                                                placeholder="Create a strong password"
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
                                        {formData.password && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Password Strength:</span>
                                                        <span className={`font-medium ${passwordStrength.strength < 50 ? 'text-red-600' : passwordStrength.strength < 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                            {passwordStrength.text}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                            style={{ width: `${passwordStrength.strength}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        {errors.password && (
                                            <p className="text-sm text-red-600 font-medium">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                className={`pl-10 pr-10 h-11 ${errors.confirmPassword ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-300'}`}
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={toggleConfirmPasswordVisibility}
                                                disabled={isLoading}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox
                                            id="terms"
                                            checked={agreeToTerms}
                                            onCheckedChange={handleAgreeToTermsChange}
                                            disabled={isLoading}
                                            className="mt-0.5"
                                        />
                                        <Label
                                            htmlFor="terms"
                                            className="text-sm text-slate-600 cursor-pointer leading-relaxed"
                                        >
                                            I agree to the{' '}
                                            <Button variant="link" className="px-0 text-sm h-auto text-slate-900 hover:text-slate-700">
                                                Terms of Service
                                            </Button>
                                            {' '}and{' '}
                                            <Button variant="link" className="px-0 text-sm h-auto text-slate-900 hover:text-slate-700">
                                                Privacy Policy
                                            </Button>
                                        </Label>
                                    </div>

                                    <Button
                                        className={`w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        type='button'
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Creating account...</span>
                                            </div>
                                        ) : (
                                            'Create account'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>

                        <CardFooter className="justify-center pb-8">
                            <p className="text-sm text-slate-600">
                                Already have an account?{' '}
                                <Link to={'/login'} className="px-0 text-slate-900 hover:text-slate-700 font-medium">
                                    Sign in here
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>

                    <div className="text-center text-xs text-slate-500 mt-6 space-x-1">
                        <span>By creating an account, you agree to our</span>
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

export default SignupPage;