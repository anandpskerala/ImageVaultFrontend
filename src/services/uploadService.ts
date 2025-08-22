import type { PaginationParams } from "@/interfaces/props/PaginationParams";
import axiosInstance from "@/utils/axiosInstance"

export const uploadImages = async (formdata: FormData) => {
    const res = await axiosInstance.post("/upload/images", formdata, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data;
}

export const getImages = async (data: PaginationParams) => {
    const res = await axiosInstance.get(`/upload/images?page=${data.page}&limit=${data.limit}&search=${data.search}`);
    return res.data;
}

export const saveImageOrder = async (images: { id: string; position: number }[]) => {
    const response = await axiosInstance.put('/upload/reorder', { images });
    return response.data;
};


export const editImageService = async (id: string, formdata: FormData) => {
    const res = await axiosInstance.patch(`/upload/image/${id}`, formdata, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data;
}


export const deleteImageService = async (imageId: string) => {
    try {
        const response = await axiosInstance.delete(`/upload/image/${imageId}`);
        if (!response.data) return false;
        return true;
    } catch (error) {
        console.error(error)
        throw new Error(`Error deleting image`);
    }
};