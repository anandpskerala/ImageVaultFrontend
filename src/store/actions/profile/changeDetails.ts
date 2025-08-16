import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type { IUser } from "@/interfaces/entities/IUser";
import axiosInstance from "@/utils/axiosInstance";



export const changeUserDetails = createAsyncThunk(
    "auth/changeUserDetails",
    async (userData: Partial<IUser>, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put("/auth/profile", userData);
            if (!response.data?.user) {
                return rejectWithValue("Invalid response from server");
            }
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                return rejectWithValue(error.response.data.message);
              }
              return rejectWithValue("Something went wrong");
        }
    }
)