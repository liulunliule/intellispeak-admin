import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
import HRApplicationTable, { HRApplication } from "../../components/hr/HRApplications";
import api from '../../services/api';
import { Modal } from "../../components/ui/modal";

export default function ManageHR() {
    const [hrApplications, setHrApplications] = useState<HRApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCvModal, setShowCvModal] = useState(false);
    const [selectedCvUrls, setSelectedCvUrls] = useState<string[]>([]);

    const fetchHRAApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/hr-applications');
            console.log("Response data:", response.data);

            if (response.data.code === 200) {
                if (Array.isArray(response.data.data)) {
                    setHrApplications(response.data.data);
                } else {
                    setError("Received data is not in the correct format.");
                }
            } else {
                setError(response.data.message || "Unable to load HR request list.");
            }
        } catch (err: any) {
            console.error("Error fetching HR requests:", err);
            setError(err.response?.data?.message || err.message || "An unknown error occurred while loading data.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Are you sure you want to approve this request?")) {
            return;
        }
        try {
            const response = await api.put(`/admin/hr/${id}/approve`);
            if (response.data.code === 200) {
                alert("Request approved successfully!");
                fetchHRAApplications();
            } else {
                alert(`Error approving request: ${response.data.message}`);
            }
        } catch (err: any) {
            console.error("Error approving request:", err);
            alert(`An error occurred: ${err.response?.data?.message || err.message || "An error occurred while approving."}`);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Are you sure you want to reject this request?")) {
            return;
        }
        try {
            const response = await api.put(`/admin/hr/${id}/reject`);
            if (response.data.code === 200) {
                alert("Request rejected successfully!");
                fetchHRAApplications();
            } else {
                alert(`Error rejecting request: ${response.data.message}`);
            }
        } catch (err: any) {
            console.error("Error rejecting request:", err);
            alert(`An error occurred: ${err.response?.data?.message || err.message || "An error occurred while rejecting."}`);
        }
    };

    const handleViewCv = (cvUrl: string) => {
        if (cvUrl) {
            const urls = cvUrl.split(';').filter(url => url.trim() !== '');
            setSelectedCvUrls(urls);
            setShowCvModal(true);
        }
    };

    const handleCloseCvModal = () => {
        setShowCvModal(false);
        setSelectedCvUrls([]);
    };

    useEffect(() => {
        fetchHRAApplications();
    }, []);

    return (
        <div>
            <PageMeta title="Manage HR Requests | Admin Dashboard" description="Page for managing HR permission requests." />
            <PageBreadcrumb pageTitle="Manage HR Requests" />
            <ComponentCard title="HR Request List">
                {loading && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-gray-600 dark:text-gray-300">Loading HR requests...</p>
                    </div>
                )}
                {error && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-red-500 font-medium">Error: {error}</p>
                    </div>
                )}
                {!loading && !error && hrApplications.length > 0 && (
                    <HRApplicationTable
                        applications={hrApplications}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onViewCv={handleViewCv}
                    />
                )}
                {!loading && !error && hrApplications.length === 0 && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-gray-600 dark:text-gray-300">There are currently no users requesting HR permissions.</p>
                    </div>
                )}
            </ComponentCard>

            <Modal
                isOpen={showCvModal}
                onClose={handleCloseCvModal}
                className="max-w-4xl p-6"
                showCloseButton={true}
            >
                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">View CV</h3>
                </div>
                <div className="mt-4 max-h-[80vh] overflow-y-auto">
                    {selectedCvUrls.length > 0 ? (
                        selectedCvUrls.map((url, index) => (
                            <img key={index} src={url} alt={`CV Image ${index + 1}`} className="w-full h-auto mb-4" />
                        ))
                    ) : (
                        <p>No CV images to display.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}