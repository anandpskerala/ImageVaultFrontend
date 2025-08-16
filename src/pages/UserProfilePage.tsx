import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Save, Eye, EyeOff, Phone, Mail, Calendar, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppSelector, type RootState } from '@/store';
import type { UserDTO } from '@/interfaces/entities/IUser';
import { NavBar } from '@/components/partials/NavBar';
import { formatDate, getPasswordStrength } from '@/utils/stringUtils';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { changeUserDetails } from '@/store/actions/profile/changeDetails';


const UserProfilePage = () => {
    const user: UserDTO = useAppSelector((state: RootState) => state.auth.user) as UserDTO;
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [loading, setLoading] = useState({
        profile: false,
        password: false
    });

    const [alerts, setAlerts] = useState({
        profile: { show: false, message: '', type: 'success' as 'success' | 'error' },
        password: { show: false, message: '', type: 'success' as 'success' | 'error' }
    });

    const dispatch = useAppDispatch();

    useEffect(() => {
        setProfileForm({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        });
    }, [user]);


    useEffect(() => {
        if (alerts.profile.show || alerts.password.show) {
            const timer = setTimeout(() => {
                setAlerts(prev => ({
                    profile: { ...prev.profile, show: false },
                    password: { ...prev.password, show: false }
                }));
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [alerts.profile.show, alerts.password.show]);

    const showAlert = (type: 'profile' | 'password', message: string, alertType: 'success' | 'error') => {
        setAlerts(prev => ({
            ...prev,
            [type]: { show: true, message, type: alertType }
        }));
    };

    const handleProfileSubmit = async () => {
        setLoading(prev => ({ ...prev, profile: true }));

        try {
            const updateData = {
                email: user.email,
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
                phone: profileForm.phone
            };
            await dispatch(changeUserDetails(updateData))

            showAlert('profile', 'Profile updated successfully!', 'success');

        } catch (error) {
            console.error(error);
            showAlert('profile', 'Failed to update profile. Please try again.', 'error');
        } finally {
            setLoading(prev => ({ ...prev, profile: false }));
        }
    };

    const handlePasswordSubmit = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showAlert('password', 'New passwords do not match.', 'error');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            showAlert('password', 'New password must be at least 8 characters long.', 'error');
            return;
        }

        setLoading(prev => ({ ...prev, password: true }));

        try {
            const passwordData = {
                email: user.email,
                password: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            };

            await dispatch(changeUserDetails({...profileForm, password: passwordData.password}))

            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showAlert('password', 'Password changed successfully!', 'success');

        } catch (error) {
            console.log(error);
            showAlert('password', 'Failed to change password. Please check your current password.', 'error');
        } finally {
            setLoading(prev => ({ ...prev, password: false }));
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };


    const passwordStrength = getPasswordStrength(passwordForm.newPassword);

    return (
        <div className="flex flex-col w-full">
            <NavBar user={user} />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
                        <p className="text-lg text-gray-600">Manage your profile information and security settings</p>
                    </div>

                    <Card className="mb-8 border-0 shadow-lg py-0">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg py-4">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <User className="h-6 w-6" />
                                </div>
                                Account Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <User className="h-4 w-4" />
                                        <Label className="text-sm font-medium">Full Name</Label>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Mail className="h-4 w-4" />
                                        <Label className="text-sm font-medium">Email</Label>
                                    </div>
                                    <p className="text-lg text-gray-900">{user.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Phone className="h-4 w-4" />
                                        <Label className="text-sm font-medium">Phone</Label>
                                    </div>
                                    <p className="text-lg text-gray-900">{user.phone}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        <Label className="text-sm font-medium">Member Since</Label>
                                    </div>
                                    <p className="text-lg text-gray-900">{formatDate(user.createdAt)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-12 mb-6">
                            <TabsTrigger value="profile" className="flex items-center gap-2 text-base">
                                <User className="h-5 w-5" />
                                Profile Information
                            </TabsTrigger>
                            <TabsTrigger value="password" className="flex items-center gap-2 text-base">
                                <Shield className="h-5 w-5" />
                                Security Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card className="border-0 shadow-lg py-0">
                                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 rounded-t-md">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <User className="h-6 w-6" />
                                        Update Profile Information
                                    </CardTitle>
                                    <CardDescription className="text-green-100">
                                        Keep your personal information up to date
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 w-full">
                                    {alerts.profile.show && (
                                        <Alert className={`mb-6 border ${alerts.profile.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                                            {alerts.profile.type === 'error' ?
                                                <AlertCircle className="h-4 w-4 text-red-600" /> :
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            }
                                            <AlertDescription className={`${alerts.profile.type === 'error' ? 'text-red-800' : 'text-green-800'} font-medium`}>
                                                {alerts.profile.message}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name *</Label>
                                                <Input
                                                    id="firstName"
                                                    type="text"
                                                    value={profileForm.firstName}
                                                    onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                                                    className="w-full h-12 border-2 focus:border-blue-500"
                                                    placeholder="Enter your first name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name *</Label>
                                                <Input
                                                    id="lastName"
                                                    type="text"
                                                    value={profileForm.lastName}
                                                    onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                                                    className="w-full h-12 border-2 focus:border-blue-500"
                                                    placeholder="Enter your last name"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full h-12 border-2 focus:border-blue-500 cursor-not-allowed"
                                                placeholder="Enter your email address"
                                                disabled={true}
                                                readOnly={true}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full h-12 border-2 focus:border-blue-500"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>

                                        <Separator className="my-6" />

                                        <Button
                                            onClick={handleProfileSubmit}
                                            disabled={loading.profile}
                                            className="w-full md:w-auto h-12 px-8 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold cursor-pointer"
                                        >
                                            {loading.profile ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                    Updating Profile...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5 mr-2" />
                                                    Update Profile
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="password">
                            <Card className="border-0 shadow-lg py-0">
                                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-t-md">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Shield className="h-6 w-6" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription className="text-purple-100">
                                        Update your password to keep your account secure
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {alerts.password.show && (
                                        <Alert className={`mb-6 border-l-4 ${alerts.password.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                                            <div className="flex items-center gap-2">
                                                {alerts.password.type === 'error' ?
                                                    <AlertCircle className="h-4 w-4 text-red-600" /> :
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                }
                                                <AlertDescription className={alerts.password.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                                                    {alerts.password.message}
                                                </AlertDescription>
                                            </div>
                                        </Alert>
                                    )}

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">Current Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentPassword"
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                    className="w-full h-12 border-2 focus:border-purple-500 pr-12"
                                                    placeholder="Enter your current password"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                >
                                                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">New Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="newPassword"
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                    className="w-full h-12 border-2 focus:border-purple-500 pr-12"
                                                    placeholder="Enter your new password"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                >
                                                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>

                                            {passwordForm.newPassword && (
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

                                            <p className="text-sm text-gray-500">Password must be at least 8 characters long</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm New Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                    className="w-full h-12 border-2 focus:border-purple-500 pr-12"
                                                    placeholder="Confirm your new password"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                >
                                                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                                                <p className="text-sm text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Passwords do not match
                                                </p>
                                            )}
                                        </div>

                                        <Separator className="my-6" />

                                        <Button
                                            onClick={handlePasswordSubmit}
                                            disabled={loading.password || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                                            className="w-full md:w-auto h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                                        >
                                            {loading.password ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                    Changing Password...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="h-5 w-5 mr-2" />
                                                    Change Password
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;