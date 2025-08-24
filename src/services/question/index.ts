export const importCsvQuestions = async (tagId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post(`/question/import-csv/${tagId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (error) {
    throw new Error(`Failed to import questions from CSV: ${error}`);
  }
};
export const getTopicTags = async (topicId: number) => {
  try {
    return await api.get(`/topic/${topicId}/tags`);
  } catch (error) {
    throw new Error(`Failed to get tags for topic: ${error}`);
  }
};

export const connectTagToTopic = async (topicId: number, tagId: number) => {
  try {
    const response = await api.get(`/topic/${topicId}/tags`);
    const existingTags = response.data;
    const tagExists = existingTags.some((tag: any) => tag.tagId === tagId);
    if (!tagExists) {
      await api.put(`/topic/${topicId}/tags/${tagId}`);
    }
    return true;
  } catch (error) {
    throw new Error(`Failed to connect tag to topic: ${error}`);
  }
};

export const createTopic = async (data: { title: string; description: string }) => {
  try {
    return await api.post('/topic', data);
  } catch (error) {
    throw new Error(`Failed to create topic: ${error}`);
  }
};

export const createTagForQuestion = async (data: { title: string; description: string }) => {
  try {
    return await api.post('/tag', data);
  } catch (error) {
    throw new Error(`Failed to create tag: ${error}`);
  }
};
export const getTopics = async () => {
  try {
    return await api.get('/topic');
  } catch (error) {
    throw new Error(`Failed to get topics: ${error}`);
  }
};
// TAGS
export const getTags = async () => {
  try {
    return await api.get('/tag');
  } catch (error) {
    throw new Error(`Failed to get tags: ${error}`);
  }
};

export const getTagsWithQuestions = async () => {
  try {
    return await api.get('/tag/with-questions');
  } catch (error) {
    throw new Error(`Failed to get tags with questions: ${error}`);
  }
};

export const getTagTopics = async (tagId: number) => {
  try {
    return await api.get(`/tag/${tagId}/topics`);
  } catch (error) {
    throw new Error(`Failed to get topics for tag: ${error}`);
  }
};

export const deleteTag = async (tagId: number) => {
  try {
    return await api.delete(`/tag/${tagId}`);
  } catch (error) {
    throw new Error(`Failed to delete tag: ${error}`);
  }
};

export const createTag = async (data: any) => {
  try {
    return await api.post('/tag', data);
  } catch (error) {
    throw new Error(`Failed to create tag: ${error}`);
  }
};

export const updateTag = async (tagId: number, data: any) => {
  try {
    return await api.put(`/tag/${tagId}`, data);
  } catch (error) {
    throw new Error(`Failed to update tag: ${error}`);
  }
};

export const removeTopicFromTag = async (tagId: number, topicId: number) => {
  try {
    return await api.delete(`/tag/${tagId}/topics/${topicId}`);
  } catch (error) {
    throw new Error(`Failed to remove topic from tag: ${error}`);
  }
};

export const assignTagToQuestions = async (tagId: number, questionIds: number[]) => {
  try {
    return await api.put(`/tag/${tagId}/questions`, questionIds);
  } catch (error) {
    throw new Error(`Failed to assign tag to questions: ${error}`);
  }
};

// INTERVIEW SESSIONS
export const getInterviewSessions = async () => {
  try {
    return await api.get('/interview-sessions/sessions/get-all');
  } catch (error) {
    throw new Error(`Failed to get interview sessions: ${error}`);
  }
};

export const createInterviewSession = async (data: any) => {
  try {
    return await api.post('/interview-sessions/sessions', data);
  } catch (error) {
    throw new Error(`Failed to create interview session: ${error}`);
  }
};

export const updateInterviewSession = async (sessionId: number, data: any) => {
  try {
    return await api.put(`/interview-sessions/sessions/${sessionId}`, data);
  } catch (error) {
    throw new Error(`Failed to update interview session: ${error}`);
  }
};
import api from '../api';

export const deleteQuestion = async (questionId: number) => {
  try {
    return await api.delete(`/question/${questionId}`);
  } catch (error) {
    throw new Error(`Failed to delete question: ${error}`);
  }
};

export const getQuestions = async () => {
  try {
    return await api.get('/question');
  } catch (error) {
    throw new Error(`Failed to get questions: ${error}`);
  }
};

export const getMyQuestions = async () => {
  try {
    return await api.get('/question/my-questions');
  } catch (error) {
    throw new Error(`Failed to get my questions: ${error}`);
  }
};

export const getQuestionDetail = async (questionId: number) => {
  try {
    return await api.get(`/question/${questionId}`);
  } catch (error) {
    throw new Error(`Failed to get question detail: ${error}`);
  }
};

export const updateQuestion = async (questionId: number, data: any) => {
  try {
    return await api.put(`/question/${questionId}`, data);
  } catch (error) {
    throw new Error(`Failed to update question: ${error}`);
  }
};

export const createQuestion = async (data: any) => {
  try {
    return await api.post('/question', data);
  } catch (error) {
    throw new Error(`Failed to create question: ${error}`);
  }
};

export const addTagToQuestion = async (questionId: number, tagId: number) => {
  try {
    return await api.put(`/tag/${questionId}/tags/${tagId}`);
  } catch (error) {
    throw new Error(`Failed to add tag to question: ${error}`);
  }
};

export const deleteTagFromQuestion = async (questionId: number, tagId: number) => {
  try {
    return await api.delete(`/tag/${questionId}/tags/${tagId}`);
  } catch (error) {
    throw new Error(`Failed to delete tag from question: ${error}`);
  }
};
