import { useState, useEffect } from "react";
import api from "../../services/api";

export const useQuestions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => { fetchQuestions(); }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/question");
            const data = res.data.map((q: any) => ({
                id: q.questionId,
                title: q.title,
                content: q.content,
                tags: q.tags,
                difficulty: convertDifficulty(q.difficulty),
                sampleAnswer: q.suitableAnswer1
            }));
            setQuestions(data);
        } catch (err) {
            setError("Lỗi tải danh sách câu hỏi");
        } finally {
            setLoading(false);
        }
    };

    const convertDifficulty = (dif: string) => {
        switch (dif) {
            case "EASY": return "Easy";
            case "MEDIUM": return "Medium";
            case "HARD": return "Hard";
            default: return "Medium";
        }
    };

    return { loading, error, questions, fetchQuestions, setQuestions };
};
