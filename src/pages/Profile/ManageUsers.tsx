import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TableAllUser from "../../components/tables/TableUsers/TableAllUser";

export default function ManageUsers() {
    const { isOpen, openModal, closeModal } = useModal();

    const handleCreateUser = () => {
        // Handle create user logic here
        console.log("Creating new user...");
        closeModal();
    };

    return (
        <>
            <PageMeta
                title="React.js Manage Users "
                description="This is React.js Profile Dashboard page"
            />
            <PageBreadcrumb pageTitle="Manage Users" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        User Management
                    </h2>
                    <Button
                        onClick={openModal}
                        className="flex items-center gap-2"
                    >
                        <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M8.9999 1.5C4.8549 1.5 1.4999 4.855 1.4999 9C1.4999 13.145 4.8549 16.5 8.9999 16.5C13.1449 16.5 16.4999 13.145 16.4999 9C16.4999 4.855 13.1449 1.5 8.9999 1.5ZM12.7499 9.5625H9.5624V12.75H8.4374V9.5625H5.2499V8.4375H8.4374V5.25H9.5624V8.4375H12.7499V9.5625Z"
                                fill=""
                            />
                        </svg>
                        Create User
                    </Button>
                </div>

                <ComponentCard title="User List">
                    <TableAllUser />
                </ComponentCard>
            </div>

            {/* Create User Modal */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Create New User
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Fill in the details to create a new user account.
                        </p>
                    </div>

                    <form className="flex flex-col">
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <div className="col-span-2 flex flex-col items-center">
                                    <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 mb-4">
                                        <img
                                            src="/images/user/default-avatar.jpg"
                                            alt="Default Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Upload Photo
                                    </Button>
                                </div>

                                <div>
                                    <Label>First Name</Label>
                                    <Input type="text" placeholder="Enter first name" />
                                </div>

                                <div>
                                    <Label>Last Name</Label>
                                    <Input type="text" placeholder="Enter last name" />
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Email Address</Label>
                                    <Input type="email" placeholder="Enter email address" />
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Phone Number</Label>
                                    <Input type="tel" placeholder="Enter phone number" />
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Password</Label>
                                    <Input type="password" placeholder="Enter password" />
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Confirm Password</Label>
                                    <Input type="password" placeholder="Confirm password" />
                                </div>

                                <div className="col-span-2">
                                    <Label>Role</Label>
                                    <select className="w-full px-4 py-2.5 text-theme-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                        <option value="">Select role</option>
                                        <option value="admin">Administrator</option>
                                        <option value="manager">Manager</option>
                                        <option value="editor">Editor</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <Label>Bio</Label>
                                    <textarea
                                        className="w-full px-4 py-2.5 text-theme-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        rows={3}
                                        placeholder="Enter bio"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleCreateUser}>
                                Create User
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}