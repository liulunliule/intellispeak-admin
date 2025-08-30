import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { getCompanies, getCompanyById, Company } from "../../services/company";

export default function ManageCompany() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const fetchCompanies = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCompanies();
            setCompanies(data);
        } catch (err: any) {
            setError(err.message || "Error loading companies");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (companyId: number) => {
        try {
            const company = await getCompanyById(companyId);
            setSelectedCompany(company);
            setShowDetailsModal(true);
        } catch (err: any) {
            alert(`Error: ${err.message || "Failed to load company details"}`);
        }
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedCompany(null);
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const getStatusColor = (isDeleted: boolean) => {
        return isDeleted ? "error" : "success";
    };

    return (
        <div>
            <PageMeta title="Manage Companies | Admin Dashboard" description="Page for managing companies." />
            <PageBreadcrumb pageTitle="Manage Companies" />

            <ComponentCard title="Company List">
                {loading && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-gray-600 dark:text-gray-300">Loading companies...</p>
                    </div>
                )}
                {error && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-red-500 font-medium">Error: {error}</p>
                    </div>
                )}
                {!loading && !error && companies.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                    <TableRow>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                            Company Name
                                        </TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                            Short Name
                                        </TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                            Created At
                                        </TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                            Status
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {companies.map((company) => (
                                        <TableRow key={company.companyId} className="relative group">
                                            <TableCell className="py-3">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={company.logoUrl}
                                                        alt={`${company.name} logo`}
                                                        className="h-8 w-8 object-contain"
                                                    />
                                                    <p
                                                        className="font-medium text-blue-600 text-sm dark:text-blue-400 cursor-pointer hover:underline"
                                                        onClick={() => handleViewDetails(company.companyId)}
                                                    >
                                                        {company.name}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                                                {company.shortName || "N/A"}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                                                {new Date(company.createAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge size="sm" color={getStatusColor(company.isDeleted)}>
                                                    {company.isDeleted ? "Inactive" : "Active"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    !loading && !error && (
                        <div className="flex justify-center items-center py-4">
                            <p className="text-gray-600 dark:text-gray-300">There are currently no companies.</p>
                        </div>
                    )
                )}
            </ComponentCard>

            <Modal
                isOpen={showDetailsModal}
                onClose={handleCloseDetailsModal}
                className="max-w-4xl p-6"
                showCloseButton={true}
            >
                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Company Details</h3>
                </div>
                <div className="mt-4 max-h-[80vh] overflow-y-auto">
                    {selectedCompany ? (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Logo</h4>
                                <img
                                    src={selectedCompany.logoUrl}
                                    alt={`${selectedCompany.name} logo`}
                                    className="h-16 w-16 object-contain"
                                />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Name</h4>
                                <p className="text-gray-700 dark:text-gray-300">{selectedCompany.name}</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Short Name</h4>
                                <p className="text-gray-700 dark:text-gray-300">{selectedCompany.shortName || "N/A"}</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h4>
                                <p className="text-gray-700 dark:text-gray-300">{selectedCompany.description}</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Website</h4>
                                <a
                                    href={selectedCompany.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {selectedCompany.website}
                                </a>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Created At</h4>
                                <p className="text-gray-700 dark:text-gray-300">{new Date(selectedCompany.createAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Updated At</h4>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {selectedCompany.updateAt ? new Date(selectedCompany.updateAt).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">HR List</h4>
                                {selectedCompany.hrList.length > 0 ? (
                                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                                        {selectedCompany.hrList.map((hr) => (
                                            <li key={hr.hrId}>
                                                {hr.name} ({hr.phone}, {hr.country}, {hr.experienceYears} years, Status: {hr.hrStatus})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-700 dark:text-gray-300">No HRs available.</p>
                                )}
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Interview Templates</h4>
                                {selectedCompany.interviewTemplateList.length > 0 ? (
                                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                                        {selectedCompany.interviewTemplateList.map((template) => (
                                            <li key={template.interviewSessionId}>
                                                {template.title} ({template.totalQuestion} questions, Created by: {template.createdBy.name})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-700 dark:text-gray-300">No interview templates available.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-300">No details to display.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}