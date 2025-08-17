import React, { useState, useRef, useEffect } from 'react';
import {
    Menu,
    X,
    User,
    Upload,
    Image as ImageIcon,
    Settings,
    LogOut,
    ChevronDown,
    Home,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logout } from '@/store/actions/auth/logout';
import type { NavbarProps, NavItem } from '@/interfaces/props/NavbarProps';



export const NavBar: React.FC<NavbarProps> = ({
    user = null,
    className = '',
    page
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: '/',
            icon: Home,
            isActive: page === 'dashboard'
        },
        {
            label: 'Upload',
            href: '/upload',
            icon: Upload,
            isActive: page === 'upload'
        },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const toggleMobileMenu = (): void => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleProfileMenu = (): void => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    const logOut = () => {
        dispatch(logout());
    }


    return (
        <nav className={`bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 ${className}`}>
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <Link to={"/"} className="w-10 h-10 bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                                <ImageIcon className="w-6 h-6 text-white" />
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <Link to={"/"} className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                                ImageVault
                            </Link>
                        </div>
                        {user && (
                            <div className="hidden md:flex items-center space-x-1 ml-30">
                                {navItems.map((item) => (
                                    <Button
                                        key={item.href}
                                        variant="ghost"
                                        className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${item.isActive
                                            ? 'bg-black text-white font-medium hover:bg-black hover:text-white'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                                            }`}
                                        onClick={() => navigate(item.href)}
                                    >
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>


                    <div className="flex items-center space-x-3">
                        {user ? (
                            <>
                                <div className="relative" ref={profileMenuRef}>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center space-x-2 p-2 cursor-pointer"
                                        onClick={toggleProfileMenu}
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full flex items-center justify-center">

                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                    </Button>

                                    {isProfileMenuOpen && (
                                        <Card className="absolute right-0 mt-2 w-56 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                                            <CardContent className="p-2">
                                                <div className="px-3 py-2 border-b border-slate-100">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {user.firstName || 'User'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <div className="py-1 space-y-1">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => navigate("/settings")}
                                                        className="w-full justify-start px-3 py-2 text-sm cursor-pointer"
                                                    >
                                                        <Settings className="w-4 h-4 mr-3" />
                                                        Settings
                                                    </Button>
                                                    <div className="border-t border-slate-100 my-1"></div>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full cursor-pointer justify-start px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={logOut}
                                                    >
                                                        <LogOut className="w-4 h-4 mr-3" />
                                                        Sign out
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="hidden sm:flex items-center space-x-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate("/login")}
                                    className="text-slate-600 hover:text-slate-900 cursor-pointer"
                                >
                                    Sign in
                                </Button>
                                <Button
                                    onClick={() => navigate("/signup")}
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 cursor-pointer"
                                >
                                    Get Started
                                </Button>
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden p-2"
                            onClick={toggleMobileMenu}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200">
                    <div className="px-4 py-4 space-y-3">
                        {user ? (
                            <div className="space-y-2">
                                {navItems.map((item) => (
                                    <Button
                                        key={item.href}
                                        variant="ghost"
                                        className={`w-full justify-start px-3 py-3 ${item.isActive ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600'
                                            }`}
                                        onClick={() => navigate(item.href)}
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate("/login")}
                                    className="w-full justify-start px-3 py-3 text-slate-600"
                                >
                                    Sign in
                                </Button>
                                <Button
                                    onClick={() => navigate("/signup")}
                                    className="w-full justify-start bg-slate-900 hover:bg-slate-800 text-white px-3 py-3"
                                >
                                    Get Started
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
