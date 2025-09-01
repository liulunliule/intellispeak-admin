import api from '../api';

export const uploadImage = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("images", file);
        const res = await api.post("/image/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data[0] ?? null;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error uploading image");
    }
};