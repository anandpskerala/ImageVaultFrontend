import axiosInstance from "@/utils/axiosInstance"

export const forgotPasswordService = async (email: string) => {
    const res = await axiosInstance.post("/auth/password", {email});
    return res.data;
}

export const resetPassword = async (requestId: string, newPassword: string) => {
    const res = await axiosInstance.patch(`/auth/password/${requestId}`, {newPassword});
    return res.data;
}