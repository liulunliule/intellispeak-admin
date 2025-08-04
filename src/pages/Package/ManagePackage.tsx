import React from "react";
import AllPackage from "../../components/tables/TablePackage/AllPackage";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const ManagePackage: React.FC = () => {
    return (
        <>
            <PageMeta
                title="React.js Manage Package Dashboard"
                description="This is React.js Manage Package Dashboard page "
            />
            <PageBreadcrumb pageTitle="Quản lý gói" />
            <div className="space-y-6">
                <ComponentCard title="Danh sách gói">
                    <AllPackage />
                </ComponentCard>
            </div>
        </>
    );
};

export default ManagePackage;
