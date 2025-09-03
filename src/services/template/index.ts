import api from '../api';

// Create new interview session (template) with full body
export const createInterviewSessionV2 = async (data: any) => {
  try {
    return await api.post('/interview-sessions/create', data);
  } catch (error) {
    throw new Error(`Failed to create interview template (v2): ${error}`);
  }
};

// Add a question to an existing interview session (template)
export const addQuestionToSession = async (sessionId: number, questionId: number) => {
  try {
    return await api.post(`/interview-sessions/${sessionId}/questions/${questionId}`);
  } catch (error) {
    throw new Error(`Failed to add question to session: ${error}`);
  }
};

// Add multiple questions to an existing interview session
export const addQuestionsToSession = async (sessionId: number, questionIds: number[]) => {
  try {
    return await api.post(`/interview-sessions/${sessionId}/questions`, { questionIds });
  } catch (error) {
    throw new Error(`Failed to add questions to session ID ${sessionId}: ${error}`);
  }
};

// Import questions from CSV into an interview session with tagId and interviewSessionId
export const importCsvQuestionsToSession = async (tagId: number, interviewSessionId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post(`/question/import-csv/${tagId}/${interviewSessionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (error) {
    throw new Error(`Failed to import questions from CSV to session: ${error}`);
  }
};

// Get list of interview sessions for a company
export const getCompanyInterviewSessions = async () => {
  try {
    return await api.get('/admin/interview-sessions/company');
  } catch (error) {
    throw new Error(`Failed to fetch company interview sessions: ${error}`);
  }
};

// Get list of all interviews for admin (including deleted)
export const getAllAdminInterviews = async () => {
  try {
    return await api.get('/admin/all-interviews');
  } catch (error) {
    throw new Error(`Failed to fetch all admin interviews: ${error}`);
  }
};

// Get list of active interviews for admin
export const getAdminInterviews = async () => {
  try {
    return await api.get('/admin/interviews');
  } catch (error) {
    throw new Error(`Failed to fetch admin interviews: ${error}`);
  }
};

// Get details of a specific interview session by ID
export const getInterviewSessionById = async (sessionId: number) => {
  try {
    return await api.get(`/interview-sessions/sessions/${sessionId}`);
  } catch (error) {
    throw new Error(`Failed to fetch interview session details for ID ${sessionId}: ${error}`);
  }
};

// Update an existing interview session
export const updateInterviewSession = async (sessionId: number, data: {
  topicId: number;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tagIds: number[];
}) => {
  try {
    return await api.put(`/interview-sessions/update/${sessionId}`, data);
  } catch (error) {
    throw new Error(`Failed to update interview session for ID ${sessionId}: ${error}`);
  }
};

// Update thumbnail of an existing interview session
export const updateInterviewSessionThumbnail = async (sessionId: number, data: {
  thumbnailURL: string;
}) => {
  try {
    return await api.put(`/interview-sessions/thumbnail/${sessionId}`, data);
  } catch (error) {
    throw new Error(`Failed to update thumbnail for interview session ID ${sessionId}: ${error}`);
  }
};

// Get list of questions not associated with an interview session
export const getAvailableQuestionsForSession = async (sessionId: number) => {
  try {
    return await api.get(`/admin/questions/available-for-session/${sessionId}`);
  } catch (error) {
    throw new Error(`Failed to fetch available questions for session ID ${sessionId}: ${error}`);
  }
};

// Delete an interview session (template)
export const deleteSession = async (sessionId: number) => {
  try {
    return await api.delete(`/interview-sessions/delete/${sessionId}`);
  } catch (error) {
    throw new Error(`Failed to delete interview session for ID ${sessionId}: ${error}`);
  }
};

// Restore a deleted interview session (template)
export const restoreSession = async (sessionId: number) => {
  try {
    return await api.put(`/interview-sessions/restore/${sessionId}`);
  } catch (error) {
    throw new Error(`Failed to restore interview session for ID ${sessionId}: ${error}`);
  }
};