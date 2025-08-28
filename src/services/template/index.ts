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