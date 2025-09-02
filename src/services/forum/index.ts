import api from '../api';

export interface ForumTopic {
    id: number;
    title: string;
    createAt: string;
    updateAt: string | null;
    deleted: boolean;
}

export interface ForumPost {
    postId: number;
    title: string;
    content: string;
    image: string[];
    userName: string;
    avatar : string;
    thumbnail: string;
    forumTopicType: ForumTopic;
    isSaved: boolean;
    createAt: string;
    reactionCount: number;
    readTimeEstimate: number;
}

export interface ForumReply {
    id: number;
    content: string;
    status: string | null;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
    user: {
        firstName: string;
        lastName: string;
        avatar: string;
    };
    yours: boolean;
}

export async function getForumTopics(): Promise<ForumTopic[]> {
    try {
        const response = await api.get('/topic-type');
        if (Array.isArray(response.data)) {
            return response.data;
        }
        console.warn('API returned unexpected data for forum topics:', response.data);
        return [];
    } catch (error) {
        console.error('Error fetching forum topics:', error);
        throw new Error('Error fetching forum topics');
    }
}

export async function addForumTopic(payload: {
    title: string;
    createAt: string;
    updateAt: string | null;
    deleted: boolean;
}): Promise<void> {
    try {
        await api.post('/topic-type', payload);
    } catch (error) {
        console.error('Error adding forum topic:', error);
        throw new Error('Error adding forum topic');
    }
}

export async function updateForumTopic(id: number, payload: {
    title: string;
    createAt: string;
    updateAt: string | null;
    deleted: boolean;
}): Promise<void> {
    try {
        await api.put(`/topic-type/${id}`, payload);
    } catch (error) {
        console.error('Error updating forum topic:', error);
        throw new Error('Error updating forum topic');
    }
}

export async function deleteForumTopic(id: number): Promise<void> {
    try {
        await api.delete(`/topic-type/${id}`);
    } catch (error) {
        console.error('Error deleting forum topic:', error);
        throw new Error('Error deleting forum topic');
    }
}

export async function getForumPosts(): Promise<ForumPost[]> {
    try {
        const response = await api.get('/forum-post');
        if (response.data.code === 200 && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        console.warn('API returned unexpected data for forum posts:', response.data);
        return [];
    } catch (error) {
        console.error('Error fetching forum posts:', error);
        throw new Error('Error fetching forum posts');
    }
}

export async function getForumPostById(id: number): Promise<ForumPost> {
    try {
        const response = await api.get(`/forum-post/${id}`);
        if (response.data.code === 200 && response.data.data) {
            return response.data.data;
        }
        console.warn('API returned unexpected data for forum post:', response.data);
        throw new Error('Forum post not found');
    } catch (error) {
        console.error(`Error fetching forum post with id ${id}:`, error);
        throw new Error('Error fetching forum post');
    }
}

export async function deleteForumPost(id: number): Promise<void> {
    try {
        await api.delete(`/forum-post/${id}`);
    } catch (error) {
        console.error(`Error deleting forum post with id ${id}:`, error);
        throw new Error('Error deleting forum post');
    }
}

export async function getForumPostReplies(postId: number): Promise<ForumReply[]> {
    try {
        const response = await api.get(`/forum-post/${postId}/replies`);
        if (response.data.code === 200 && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        console.warn('API returned unexpected data for forum post replies:', response.data);
        return [];
    } catch (error) {
        console.error(`Error fetching replies for forum post with id ${postId}:`, error);
        throw new Error('Error fetching forum post replies');
    }
}