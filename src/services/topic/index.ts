import api from '../api';

export const getTopicsWithTags = async () => {
    try {
        const res = await api.get("/topic");
        const topics = await Promise.all(
            res.data.map(async (topic: any) => {
                try {
                    const tagsRes = await api.get(`/topic/${topic.topicId}/tags`);
                    return { ...topic, tags: tagsRes.data ?? [] };
                } catch {
                    return { ...topic, tags: [] };
                }
            })
        );
        return topics;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error loading topics.");
    }
};

export const getAllTags = async () => {
    try {
        const res = await api.get("/tag");
        return (res.data.data ?? []).map((tag: any) => ({
            tagId: tag.tagId || tag.id,
            title: tag.title,
            description: tag.description,
            createdAt: tag.createdAt || tag.createAt,
            updatedAt: tag.updatedAt || tag.updateAt,
            isDeleted: tag.isDeleted,
        }));
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error loading tag list");
    }
};

export const uploadImage = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("images", file);
        const res = await api.post("/image/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("uploadImage",res);
        
        return res.data[0] ?? null;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error uploading image");
    }
};

export const updateTopicThumbnail = async (topicId: number, thumbnailUrl: string) => {
    try {
        await api.put(`/topic/thumbnail/${topicId}`, thumbnailUrl, {
            headers: { "Content-Type": "text/plain" },
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error updating thumbnail");
    }
};

export const createTopic = async (data: { title: string; description: string; longDescription?: string }) => {
    try {
        const res = await api.post("/topic", data);
        return res.data.topicId;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error adding topic");
    }
};

export const updateTopic = async (
    topicId: number,
    data: { title: string; description: string; longDescription?: string; thumbnail?: string }
) => {
    try {
        const res = await api.put(`/topic/${topicId}`, data);
        return res.data; // Trả về response để log
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error updating topic");
    }
};

export const deleteTopic = async (topicId: number) => {
    try {
        await api.delete(`/topic/${topicId}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error deleting topic");
    }
};

export const getTopicTags = async (topicId: number) => {
    try {
        const res = await api.get(`/topic/${topicId}/tags`);
        return res.data ?? [];
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error fetching topic tags");
    }
};

export const addTagToTopic = async (topicId: number, tagId: number) => {
    try {
        await api.put(`/topic/${topicId}/tags/${tagId}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error adding tag to topic");
    }
};

export const removeTagFromTopic = async (topicId: number, tagId: number) => {
    try {
        await api.delete(`/topic/${topicId}/tags/${tagId}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error removing tag from topic");
    }
};
