import { useState } from "react";
import api from "../../services/api";

export const useTagsTopics = () => {
    const [topics, setTopics] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchTopics = async () => {
        setLoading(true);
        try {
            const res = await api.get("/topic");
            setTopics(res.data);
        } catch {
            setError("Lỗi tải chủ đề");
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        setLoading(true);
        try {
            const res = await api.get("/tag");
            setTags(res.data.data || []);
        } catch {
            setError("Lỗi tải tag");
        } finally {
            setLoading(false);
        }
    };

    return { topics, tags, loading, error, fetchTopics, fetchTags, setTags, setTopics };
};
