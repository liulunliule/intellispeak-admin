export interface Tag {
    tagId: number;
    title: string;
    description: string;
    createdAt?: string;
    updatedAt?: string | null;
    isDeleted?: boolean;
}

export interface Topic {
    topicId: number;
    title: string;
    description: string;
    longDescription?: string;
    createdAt?: string;
    thumbnail?: string | null;
    updatedAt?: string | null;
    isDeleted?: boolean;
    tags?: Tag[];
}
