// src/api/questionApi.ts
import api from "../services/api"; // axios instance đã cấu hình baseURL + interceptors

// Lấy danh sách câu hỏi
export const getQuestionsApi = async () => {
    return await api.get("/questions");
};

// Thêm tag vào câu hỏi
export const addTagToQuestionApi = async (questionId: number, tagId: number) => {
    return await api.post(`/questions/${questionId}/tags/${tagId}`);
};

// Xóa tag khỏi câu hỏi
export const deleteTagFromQuestionApi = async (questionId: number, tagId: number) => {
    return await api.delete(`/questions/${questionId}/tags/${tagId}`);
};
