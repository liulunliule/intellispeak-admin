import React, { useState } from 'react';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';

interface Session {
    id: number;
    name: string;
    date: string;
    interviewer: string;
    status: string;
    notes?: string;
}

const initialSessions: Session[] = [
    { id: 1, name: 'Session 1', date: '2024-06-10', interviewer: 'Nguyen Van A', status: 'Đã lên lịch', notes: 'Ghi chú 1' },
    { id: 2, name: 'Session 2', date: '2024-06-12', interviewer: 'Tran Thi B', status: 'Hoàn thành', notes: 'Ghi chú 2' },
    { id: 3, name: 'Session 3', date: '2024-06-15', interviewer: 'Le Van C', status: 'Đã hủy', notes: 'Ghi chú 3' },
];

const ManageInterviewSessions: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editSession, setEditSession] = useState<Session | null>(null);
    const [sessionData, setSessionData] = useState({ name: '', date: '', interviewer: '', status: '', notes: '' });
    const [viewSession, setViewSession] = useState<Session | null>(null);

    const filteredSessions = sessions.filter(session =>
        session.name.toLowerCase().includes(search.toLowerCase()) ||
        session.interviewer.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        setEditSession(null);
        setSessionData({ name: '', date: '', interviewer: '', status: '', notes: '' });
        setModalOpen(true);
    };

    const handleEdit = (session: Session) => {
        setEditSession(session);
        setSessionData({
            name: session.name,
            date: session.date,
            interviewer: session.interviewer,
            status: session.status,
            notes: session.notes || '',
        });
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa session này?')) {
            setSessions(sessions.filter(session => session.id !== id));
        }
    };

    const handleSave = () => {
        if (editSession) {
            setSessions(sessions.map(session => session.id === editSession.id ? { ...editSession, ...sessionData } : session));
        } else {
            setSessions([
                ...sessions,
                { id: Date.now(), ...sessionData },
            ]);
        }
        setModalOpen(false);
    };

    const handleView = (session: Session) => {
        setViewSession(session);
        setViewModalOpen(true);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Quản lý Phỏng vấn Session</h1>
            <div className="flex items-center mb-4 gap-2">
                <input
                    type="text"
                    placeholder="Tìm kiếm session..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
                <Button onClick={handleAdd}>Tạo Session mới</Button>
            </div>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">Tên Session</th>
                        <th className="p-2 border">Ngày</th>
                        <th className="p-2 border">Người phỏng vấn</th>
                        <th className="p-2 border">Trạng thái</th>
                        <th className="p-2 border">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSessions.map(session => (
                        <tr key={session.id}>
                            <td className="p-2 border">{session.name}</td>
                            <td className="p-2 border text-center">{session.date}</td>
                            <td className="p-2 border text-center">{session.interviewer}</td>
                            <td className="p-2 border text-center">{session.status}</td>
                            <td className="p-2 border text-center">
                                <Button size="sm" onClick={() => handleView(session)}>Xem</Button>
                                <Button size="sm" onClick={() => handleEdit(session)} className="ml-2">Sửa</Button>
                                <Button size="sm" variant="outline" onClick={() => handleDelete(session.id)} className="ml-2">Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {modalOpen && (
                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-2">{editSession ? 'Sửa Session' : 'Tạo Session mới'}</h2>
                        <input
                            type="text"
                            value={sessionData.name}
                            onChange={e => setSessionData({ ...sessionData, name: e.target.value })}
                            className="border px-2 py-1 rounded w-full mb-2"
                            placeholder="Tên Session"
                        />
                        <input
                            type="date"
                            value={sessionData.date}
                            onChange={e => setSessionData({ ...sessionData, date: e.target.value })}
                            className="border px-2 py-1 rounded w-full mb-2"
                            placeholder="Ngày"
                        />
                        <input
                            type="text"
                            value={sessionData.interviewer}
                            onChange={e => setSessionData({ ...sessionData, interviewer: e.target.value })}
                            className="border px-2 py-1 rounded w-full mb-2"
                            placeholder="Người phỏng vấn"
                        />
                        <input
                            type="text"
                            value={sessionData.status}
                            onChange={e => setSessionData({ ...sessionData, status: e.target.value })}
                            className="border px-2 py-1 rounded w-full mb-2"
                            placeholder="Trạng thái"
                        />
                        <textarea
                            value={sessionData.notes}
                            onChange={e => setSessionData({ ...sessionData, notes: e.target.value })}
                            className="border px-2 py-1 rounded w-full mb-2"
                            placeholder="Ghi chú"
                        />
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setModalOpen(false)} variant="outline">Hủy</Button>
                            <Button onClick={handleSave}>{editSession ? 'Lưu' : 'Tạo'}</Button>
                        </div>
                    </div>
                </Modal>
            )}
            {viewModalOpen && viewSession && (
                <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)}>
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-2">Chi tiết Session</h2>
                        <div><b>Tên:</b> {viewSession.name}</div>
                        <div><b>Ngày:</b> {viewSession.date}</div>
                        <div><b>Người phỏng vấn:</b> {viewSession.interviewer}</div>
                        <div><b>Trạng thái:</b> {viewSession.status}</div>
                        <div><b>Ghi chú:</b> {viewSession.notes}</div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ManageInterviewSessions; 