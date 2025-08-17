import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { resetPassword } from '@/services/passwordService';
import { NavBar } from '@/components/partials/NavBar';
import { useAppSelector, type RootState } from '@/store';
import { AxiosError } from 'axios';
import { getPasswordStrength } from '@/utils/stringUtils';

const ResetPasswordPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            return;
        }
        setIsLoading(true);
        setMessage(null);

        try {
            await resetPassword(id as string, password);
            setMessage({ type: "success", text: "Password reset successful. You can now login." });
        } catch (error) {
            console.error(error)
            if (error instanceof AxiosError) {
                setMessage({ type: "error", text: error.response?.data.message });
            } else {
                setMessage({ type: "error", text: "An error occurred. Please try again." });
            }
        } finally {
            setPassword("");
            setConfirmPassword("");
            setIsLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(password);

    useEffect(() => {
        if (!id || !email) {
            setMessage({ type: "error", text: "Invalid reset link" });
        }
    }, [id, email]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (message) {
            timeout = setTimeout(() => {
                setMessage(null);
            }, 5000);
        }

        return () => clearTimeout(timeout);
    }, [message])

    return (
        <div className="flex flex-col w-full">
            <NavBar user={user} />
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>Enter your new password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    {password && (
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
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            {message && (
                                <Alert variant={message.type === "success" ? "default" : "destructive"} className={`mt-4 ${message.type == 'success' ? 'text-green-500': ''}`}>
                                    <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
                                    <AlertDescription>{message.text}</AlertDescription>
                                </Alert>
                            )}
                            <Button className="w-full mt-4 cursor-pointer" type="submit" disabled={isLoading || !id}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link to="/login" className="text-sm text-blue-600 hover:underline">
                            Back to Login
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default ResetPasswordPage