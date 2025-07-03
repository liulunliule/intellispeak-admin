import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import { useNavigate } from "react-router";

interface Order {
    id: number;
    user: {
        image: string;
        name: string;
        role: string;
    };
    projectName: string;
    team: {
        images: string[];
    };
    status: string;
    budget: string;
}

const tableData: Order[] = [
    {
        id: 1,
        user: {
            image: "/images/user/user-17.jpg",
            name: "Lindsey Curtis",
            role: "Web Designer",
        },
        projectName: "Agency Website",
        team: {
            images: [
                "/images/user/user-22.jpg",
                "/images/user/user-23.jpg",
                "/images/user/user-24.jpg",
            ],
        },
        budget: "3.9K",
        status: "Active",
    },
    {
        id: 2,
        user: {
            image: "/images/user/user-18.jpg",
            name: "Kaiya George",
            role: "Project Manager",
        },
        projectName: "Technology",
        team: {
            images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
        },
        budget: "24.9K",
        status: "Pending",
    },
    {
        id: 3,
        user: {
            image: "/images/user/user-17.jpg",
            name: "Zain Geidt",
            role: "Content Writing",
        },
        projectName: "Blog Writing",
        team: {
            images: ["/images/user/user-27.jpg"],
        },
        budget: "12.7K",
        status: "Active",
    },
    {
        id: 4,
        user: {
            image: "/images/user/user-20.jpg",
            name: "Abram Schleifer",
            role: "Digital Marketer",
        },
        projectName: "Social Media",
        team: {
            images: [
                "/images/user/user-28.jpg",
                "/images/user/user-29.jpg",
                "/images/user/user-30.jpg",
            ],
        },
        budget: "2.8K",
        status: "Cancel",
    },
    {
        id: 5,
        user: {
            image: "/images/user/user-21.jpg",
            name: "Carla George",
            role: "Front-end Developer",
        },
        projectName: "Website",
        team: {
            images: [
                "/images/user/user-31.jpg",
                "/images/user/user-32.jpg",
                "/images/user/user-33.jpg",
            ],
        },
        budget: "4.5K",
        status: "Active",
    },
];

export default function TableAllUser() {
    const navigate = useNavigate();
    const { isOpen, openModal, closeModal } = useModal();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

    const handleEdit = (order: Order) => {
        setSelectedOrder(order);
        openModal();
        setDropdownOpen(null);
    };

    const handleDelete = (id: number) => {
        console.log("Deleting order with id:", id);
        setDropdownOpen(null);
    };

    const handleDetail = (id: number) => {
        navigate(`/profile?id=${id}`);
        setDropdownOpen(null);
    };

    const handleSave = () => {
        console.log("Saving changes for order:", selectedOrder);
        closeModal();
    };

    const toggleDropdown = (id: number) => {
        setDropdownOpen(dropdownOpen === id ? null : id);
    };

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    User
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Major Name
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Team
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Status
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Budget
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {tableData.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 overflow-hidden rounded-full">
                                                <img
                                                    width={40}
                                                    height={40}
                                                    src={order.user.image}
                                                    alt={order.user.name}
                                                />
                                            </div>
                                            <div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {order.user.name}
                                                </span>
                                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                    {order.user.role}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {order.projectName}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <div className="flex -space-x-2">
                                            {order.team.images.map((teamImage, index) => (
                                                <div
                                                    key={index}
                                                    className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                                                >
                                                    <img
                                                        width={24}
                                                        height={24}
                                                        src={teamImage}
                                                        alt={`Team member ${index + 1}`}
                                                        className="w-full size-6"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <Badge
                                            size="sm"
                                            color={
                                                order.status === "Active"
                                                    ? "success"
                                                    : order.status === "Pending"
                                                        ? "warning"
                                                        : "error"
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {order.budget}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleDropdown(order.id)}
                                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-gray-500"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>
                                            {dropdownOpen === order.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 dark:bg-gray-800 dark:border dark:border-gray-700">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => handleDetail(order.id)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            Detail
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(order)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(order.id)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Order
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Update the order details below.
                        </p>
                    </div>

                    <form className="flex flex-col">
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <div className="col-span-2 flex flex-col items-center">
                                    <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 mb-4">
                                        <img
                                            src={selectedOrder?.user.image || "/images/user/default-avatar.jpg"}
                                            alt="User Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Change Photo
                                    </Button>
                                </div>

                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        type="text"
                                        value={selectedOrder?.user.name || ""}
                                        onChange={(e) => setSelectedOrder({
                                            ...selectedOrder!,
                                            user: {
                                                ...selectedOrder!.user,
                                                name: e.target.value
                                            }
                                        })}
                                    />
                                </div>

                                <div>
                                    <Label>Role</Label>
                                    <Input
                                        type="text"
                                        value={selectedOrder?.user.role || ""}
                                        onChange={(e) => setSelectedOrder({
                                            ...selectedOrder!,
                                            user: {
                                                ...selectedOrder!.user,
                                                role: e.target.value
                                            }
                                        })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label>Project Name</Label>
                                    <Input
                                        type="text"
                                        value={selectedOrder?.projectName || ""}
                                        onChange={(e) => setSelectedOrder({
                                            ...selectedOrder!,
                                            projectName: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label>Status</Label>
                                    <select
                                        className="w-full px-4 py-2.5 text-theme-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        value={selectedOrder?.status || ""}
                                        onChange={(e) => setSelectedOrder({
                                            ...selectedOrder!,
                                            status: e.target.value
                                        })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Cancel">Cancel</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <Label>Budget</Label>
                                    <Input
                                        type="text"
                                        value={selectedOrder?.budget || ""}
                                        onChange={(e) => setSelectedOrder({
                                            ...selectedOrder!,
                                            budget: e.target.value
                                        })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}