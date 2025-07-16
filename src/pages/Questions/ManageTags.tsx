import React, { useState } from 'react';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';

interface Tag {
    id: number;
    name: string;
    usageCount: number;
    createdAt: string;
}

const initialTags: Tag[] = [
    { id: 1, name: 'Frontend', usageCount: 12, createdAt: '2024-06-01' },
    { id: 2, name: 'Backend', usageCount: 8, createdAt: '2024-06-02' },
    { id: 3, name: 'DevOps', usageCount: 5, createdAt: '2024-06-03' },
];

const ManageTags: React.FC = () => {
    const [tags, setTags] = useState<Tag[]>(initialTags);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editTag, setEditTag] = useState<Tag | null>(null);
    const [tagName, setTagName] = useState('');

    const filteredTags = tags.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()));

    const handleAdd = () => {
        setEditTag(null);
        setTagName('');
        setModalOpen(true);
    };

    const handleEdit = (tag: Tag) => {
        setEditTag(tag);
        setTagName(tag.name);
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa tag này?')) {
            setTags(tags.filter(tag => tag.id !== id));
        }
    };

    const handleSave = () => {
        if (editTag) {
            setTags(tags.map(tag => tag.id === editTag.id ? { ...tag, name: tagName } : tag));
        } else {
            setTags([...tags, { id: Date.now(), name: tagName, usageCount: 0, createdAt: new Date().toISOString().slice(0, 10) }]);
        }
        setModalOpen(false);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Quản lý Tag</h1>
            <div className="flex items-center mb-4 gap-2">
                <input
                    type="text"
                    placeholder="Tìm kiếm tag..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
                <Button onClick={handleAdd}>Thêm Tag mới</Button>
            </div>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">Tên Tag</th>
                        <th className="p-2 border">Số lượng sử dụng</th>
                        <th className="p-2 border">Ngày tạo</th>
                        <th className="p-2 border">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTags.map(tag => (
                        <tr key={tag.id}>
                            <td className="p-2 border">{tag.name}</td>
                            <td className="p-2 border text-center">{tag.usageCount}</td>
                            <td className="p-2 border text-center">{tag.createdAt}</td>
                            <td className="p-2 border text-center">
                                <Button size="sm" onClick={() => handleEdit(tag)}>Sửa</Button>
                                <Button size="sm" variant="outline" onClick={() => handleDelete(tag.id)} className="ml-2">Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {modalOpen && (
                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-2">{editTag ? 'Sửa Tag' : 'Thêm Tag mới'}</h2>
                        <input
                            type="text"
                            value={tagName}
                            onChange={e => setTagName(e.target.value)}
                            className="border px-2 py-1 rounded w-full mb-4"
                            placeholder="Tên Tag"
                        />
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setModalOpen(false)} variant="outline">Hủy</Button>
                            <Button onClick={handleSave}>{editTag ? 'Lưu' : 'Thêm'}</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ManageTags; 