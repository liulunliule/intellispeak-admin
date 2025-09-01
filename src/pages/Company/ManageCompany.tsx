import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { MoreDotIcon } from "../../icons";
import { getCompanies, getCompanyById, updateCompany, deleteCompany, Company } from "../../services/company";
import { uploadImage } from "../../services/image";

export default function ManageCompany() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        shortName: '',
        description: '',
        logoUrl: '',
        website: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchCompanies = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCompanies();
            setCompanies(data);
            setFilteredCompanies(data);
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
            setDropdownOpen(null);
        } catch (err: any) {
            alert(`Error: ${err.message || "Failed to load company details"}`);
        }
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedCompany(null);
    };

    const handleEdit = (company: Company) => {
        setSelectedCompany(company);
        setEditForm({
            name: company.name,
            shortName: company.shortName || '',
            description: company.description || '',
            logoUrl: company.logoUrl,
            website: company.website,
        });
        setLogoFile(null);
        setLogoPreview(company.logoUrl || null);
        setEditError(null);
        setShowEditModal(true);
        setDropdownOpen(null);
        setIsSaveDisabled(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedCompany(null);
        setEditError(null);
        setLogoFile(null);
        setLogoPreview(null);
        setIsSaveDisabled(true);
        setIsSaving(false);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleClearLogo = () => {
        setLogoFile(null);
        setLogoPreview(selectedCompany?.logoUrl || null);
    };

    const isValidUrl = (url: string) => {
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
        return urlPattern.test(url);
    };

    const handleEditSubmit = async () => {
        if (!selectedCompany) return;
        setEditError(null);
        setIsSaving(true);
        try {
            if (!isValidUrl(editForm.logoUrl)) {
                throw new Error("Invalid logo URL format");
            }
            if (!isValidUrl(editForm.website)) {
                throw new Error("Invalid website URL format");
            }

            let updatedLogoUrl = editForm.logoUrl;
            if (logoFile) {
                const uploadedUrl = await uploadImage(logoFile);
                if (uploadedUrl) {
                    updatedLogoUrl = uploadedUrl;
                } else {
                    throw new Error("Failed to upload logo");
                }
            }
            await updateCompany(selectedCompany.companyId, {
                ...editForm,
                logoUrl: updatedLogoUrl,
            });
            await fetchCompanies();
            setShowEditModal(false);
            setSelectedCompany(null);
            setEditError(null);
            setLogoFile(null);
            setLogoPreview(null);
            setIsSaveDisabled(true);
        } catch (err: any) {
            setEditError(err.message || "Failed to update company");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (company: Company) => {
        setSelectedCompany(company);
        setShowDeleteModal(true);
        setDropdownOpen(null);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCompany) return;
        try {
            await deleteCompany(selectedCompany.companyId);
            await fetchCompanies();
            setShowDeleteModal(false);
            setSelectedCompany(null);
            setDeleteError(null);
        } catch (err: any) {
            setDeleteError(err.message || "Failed to delete company");
        }
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedCompany(null);
        setDeleteError(null);
    };

    const toggleDropdown = (companyId: number) => {
        setDropdownOpen(dropdownOpen === companyId ? null : companyId);
    };

    useEffect(() => {
        if (!selectedCompany) return;

        const hasChanges =
            editForm.name !== selectedCompany.name ||
            editForm.shortName !== (selectedCompany.shortName || '') ||
            editForm.description !== (selectedCompany.description || '') ||
            editForm.logoUrl !== selectedCompany.logoUrl ||
            editForm.website !== selectedCompany.website ||
            logoFile !== null;

        const isValid =
            editForm.name.trim() !== '' &&
            editForm.logoUrl.trim() !== '' &&
            editForm.website.trim() !== '' &&
            isValidUrl(editForm.logoUrl) &&
            isValidUrl(editForm.website);

        setIsSaveDisabled(!hasChanges || !isValid);
    }, [editForm, logoFile, selectedCompany]);

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        const filtered = companies.filter((company) =>
            company.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredCompanies(filtered);
    }, [search, companies]);

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
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="ml-2 text-gray-600 dark:text-gray-300">Loading companies...</p>
                    </div>
                )}
                {error && (
                    <div className="flex justify-center items-center py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                        <p className="text-red-500 font-medium">Error: {error}</p>
                    </div>
                )}
                {!loading && !error && (
                    <>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search companies by name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                        {filteredCompanies.length > 0 ? (
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
                                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                                    Actions
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {filteredCompanies.map((company) => (
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
                                                    <TableCell className="py-3 relative">
                                                        <button
                                                            onClick={() => toggleDropdown(company.companyId)}
                                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                                        >
                                                            <MoreDotIcon className="h-5 w-5" />
                                                        </button>
                                                        {dropdownOpen === company.companyId && (
                                                            <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => handleViewDetails(company.companyId)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    >
                                                                        Details
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEdit(company)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(company)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center py-4">
                                <p className="text-gray-600 dark:text-gray-300">
                                    {search ? "No companies found matching your search criteria." : "There are currently no companies."}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </ComponentCard>

            {/* Company Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={handleCloseDetailsModal}
                className="max-w-4xl w-full mx-4 sm:mx-6"
                showCloseButton={true}
            >
                <div className="p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-lg">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                            Company Details
                        </h3>
                    </div>
                    <div className="mt-6 space-y-6">
                        {selectedCompany ? (
                            <div className="space-y-6">
                                {/* Logo */}
                                <div className="flex items-center gap-4">
                                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Logo</h4>
                                        <img
                                            src={selectedCompany.logoUrl}
                                            alt={`${selectedCompany.name} logo`}
                                            className="h-20 w-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Name</h4>
                                            <p className="text-gray-700 dark:text-gray-300">{selectedCompany.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                        </svg>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Short Name</h4>
                                            <p className="text-gray-700 dark:text-gray-300">{selectedCompany.shortName || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Created At</h4>
                                            <p className="text-gray-700 dark:text-gray-300">{new Date(selectedCompany.createAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Updated At</h4>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {selectedCompany.updateAt ? new Date(selectedCompany.updateAt).toLocaleDateString() : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
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
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.5 3.5 0 001.946-.806 3.5 3.5 0 014.589 0 3.5 3.5 0 001.946.806 3.5 3.5 0 013.138 3.138 3.5 3.5 0 00.806 1.946 3.5 3.5 0 010 4.589 3.5 3.5 0 00-.806 1.946 3.5 3.5 0 01-3.138 3.138 3.5 3.5 0 00-1.946.806 3.5 3.5 0 01-4.589 0 3.5 3.5 0 00-1.946-.806 3.5 3.5 0 01-3.138-3.138 3.5 3.5 0 00-.806-1.946 3.5 3.5 0 010-4.589 3.5 3.5 0 00.806-1.946 3.5 3.5 0 013.138-3.138z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Status</h4>
                                            <Badge size="sm" color={getStatusColor(selectedCompany.isDeleted)}>
                                                {selectedCompany.isDeleted ? "Inactive" : "Active"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                                    <p className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
                                        {selectedCompany.description || "No description available."}
                                    </p>
                                </div>

                                {/* HR List */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">HR List</h4>
                                    {selectedCompany.hrList.length > 0 ? (
                                        <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
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

                                {/* Interview Templates */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interview Templates</h4>
                                    {selectedCompany.interviewTemplateList.length > 0 ? (
                                        <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
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
                            <p className="text-gray-700 dark:text-gray-300 text-center">No details to display.</p>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={handleCloseEditModal}
                className="max-w-lg w-full mx-4 sm:mx-6 transition-all duration-300"
                showCloseButton={true}
            >
                <div className="p-8 sm:p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-lg">
                    <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">Edit Company</h3>
                    {editError && (
                        <div className="mb-6 flex items-center gap-2 bg-red-100 dark:bg-red-800/30 border border-red-300 dark:border-red-700 rounded-lg p-4 text-red-600 dark:text-red-400 text-sm">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{editError}</span>
                        </div>
                    )}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Logo <span className="text-red-500">*</span> {logoFile ? `(${logoFile.name})` : "(Current Logo)"}
                            </label>
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="h-24 w-24 object-contain rounded-md border-2 border-gray-200 dark:border-gray-700 shadow-sm mb-4 transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-400"
                                />
                            ) : (
                                <div className="h-24 w-24 flex items-center justify-center rounded-md border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 mb-4">
                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <label className="flex-1">
                                    <span className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 text-sm font-medium">
                                        Choose File
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                    />
                                </label>
                                {logoFile && (
                                    <Button
                                        variant="outline"
                                        onClick={handleClearLogo}
                                        className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Accepted formats: JPG, PNG, SVG</p>
                        </div>
                        <div>
                            <label className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter company name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 hover:border-gray-300 dark:hover:border-gray-600"

                            />
                        </div>
                        <div>
                            <label className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Short Name
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter short name (optional)"
                                value={editForm.shortName}
                                onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })}
                                className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Description
                            </label>
                            <textarea
                                placeholder="Enter company description (optional)"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                                rows={4}
                            />
                        </div>

                        <div>
                            <label className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Website <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter website URL (e.g., https://example.com)"
                                value={editForm.website}
                                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                            />
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                variant="outline"
                                onClick={handleCloseEditModal}
                                className="px-6 py-3 text-base font-medium text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleEditSubmit}
                                disabled={isSaveDisabled || isSaving}
                                className={`px-6 py-3 text-base font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 rounded-lg ${isSaveDisabled || isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {isSaving ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={handleCloseDeleteModal}
                className="max-w-md w-full mx-4 sm:mx-6"
            >
                <div className="p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-lg text-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto text-red-500 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        Confirm Deletion
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to delete the company{' '}
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {selectedCompany?.name}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    {deleteError && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-500 dark:text-red-400">
                            {deleteError}
                        </div>
                    )}
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={handleCloseDeleteModal}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}